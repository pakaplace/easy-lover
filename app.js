require("dotenv").config();
const express = require("express");
const app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);
const port = process.env.PORT || 4000;
const helmet = require("helmet");
const _ = require("lodash");
const cors = require("cors");
const { Op } = require("sequelize");

const client = require("twilio")(
  process.env.TWILIO_PROD_SID,
  process.env.TWILIO_PROD_TOKEN
);

const models = require("./models/index");
const { Survey, User, Response, Interaction } = require("./models");

const { isUUID, ignoreIfFailed, compareTwoResponses } = require("./utils");

models.sequelize.sync();
// Middleware
app.use(helmet());
app.use(require("./middlewares/BodyParser"));
var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

app.get("/", (req, res, next) => {
  res.status(200).send("hello jon");
});
/*
  PHONE NUMBER used as userId
*/
// Refactor to check sender user id & token
app.get("/sendlink/:phoneNumber", async (req, res, next) => {
  const { User } = models;
  const { phoneNumber } = req.params;
  let foundUser = await User.findOne({ phoneNumber });
  if (!foundUser) {
    return res
      .status(206)
      .send({ error: "No user with that phone number was found." });
  }
  try {
    let message = await client.messages.create({
      body: `Join In Real Life link at ${process.env.HOST_URL}/user/${foundUser.id}`,
      from: process.env.TWILIO_PROD_NUMBER,
      to: foundUser.phoneNumber
    });
    return res.status(200).send({ message });
  } catch (error) {
    console.error("Error sendingLink", error);
    res.status(206).send({ error });
  }
});

app.get("/verifyNumber/:phoneNumber", async (req, res, next) => {
  client.lookups
    .phoneNumbers(req.params.phoneNumber)
    .fetch()
    .then(phone_number => {
      console.log("Phone Number is verified", phone_number);
      res.status(200).send("Phone number is verified");
    })
    .catch(error => {
      res.status(206).send({ error });
    });
});

// User Routes
app.post("/user", async (req, res, next) => {
  const { userFields } = req.body;
  try {
    const existingUser = await User.findOne({
      where: {
        phoneNumber: {
          [Op.iLike]: userFields.phoneNumber
        }
      },
      include: [{ model: Response, as: "Responses" }]
    });
    if (existingUser) {
      return res.status(200).send({ user: existingUser, existing: true });
    }
    const user = await User.create(userFields);
    res.status(200).send({ user, existing: false });
  } catch (e) {
    return res.status(206).send({ error: e.message });
  }
});

app.put("/user/:phoneNumber", async (req, res, next) => {
  const { phoneNumber } = req.params;
  if (!req.params.phoneNumber) {
    res.status(206).send({ error: "Phone Number required in PUT request." });
  }
  try {
    const { userFields } = req.body;
    let updatedUser = await User.update(userFields, {
      where: { phoneNumber },
      returning: true,
      plain: true,
      include: [{ model: Response, as: "Responses" }]
    });
    res.status(200).send({ user: updatedUser });
  } catch (e) {
    return res.status(200).send({ error: e.message });
  }
});

// app.post("/sendMessage", async (req, res, next) => {
//   console.log("sending message....", twilioClient.messages);
//   try {
//     let message = await twilioClient.messages.create({
//       body: "Find your match?",
//       from: process.env.TWILIO_NUMBER,
//       to: "+18137657071"
//     });
//     console.log("Message~~~~~~~~~~~~~~", message.sid);
//     return res.status(200).send({ message });
//   } catch (err) {
//     res.status(206).send({ err });
//   }
// });
// Returns user data and response

app.get("/user/:phoneNumber", async (req, res, next) => {
  const { phoneNumber } = req.params;
  try {
    if (!phoneNumber) {
      return res.status(400).send({
        error: "You must include a phone number the req.params"
      });
    }
    client.lookups
      .phoneNumbers(phoneNumber)
      .fetch({ countryCode: "US" })
      .then(phone_number => {
        console.log("Phone Number is verified", phone_number);
      })
      .catch(error => {
        res.status(206).send({ error });
      });

    const foundUser = await User.findOne({
      where: {
        phoneNumber
      },
      include: [
        {
          model: Response,
          as: "Responses"
          // attributes: [],
        }
      ]
    });
    //send url to user's phone number
    if (foundUser) return res.status(200).send({ user: foundUser });
    else {
      res.status(200).send({ error: "No user exists with that phone number" });
    }
  } catch (err) {
    return res.status(206).send({ error: err.message });
  }
});

app.post("/survey", async (req, res, next) => {
  const { surveyFields } = req.body;
  try {
    const idNumber = Math.floor(1000 + Math.random() * 9000);
    const survey = await Survey.create({ idNumber, ...surveyFields });
    return res.status(200).send({ survey });
  } catch (e) {
    console.error("Error creating survey", e);
    return res.status(206).send({ error: err.message });
  }
});

app.get("/survey/:id", async (req, res, next) => {
  const id = req.params.id;
  try {
    let foundSurvey = await Survey.findOne({
      where: {
        id
      }
    });
    if (!foundSurvey) {
      return res
        .send(206)
        .send({ error: `Survey with id ${id} does not exist...` });
    }
    return res.status(200).send({ survey: foundSurvey });
  } catch (e) {
    return res.status(206).send({ error: err.message });
  }
});

app.post("/response", async (req, res, next) => {
  const { responseFields } = req.body;
  try {
    const existingResponse = await Response.findOne({
      where: {
        surveyId: responseFields.surveyId,
        userId: responseFields.userId
      },
      include: [{ model: User, as: "User" }]
    });
    if (existingResponse) {
      res.status(206).send({
        error: "User has already submitted a response for this survey",
        existingResponse
      });
      res.status(206).send({
        error: "User has already submitted a response for this survey"
      });
    }
    const response = await Response.create(responseFields);
    await client.messages.create({
      body: `Thank you for signing up. You can return and login with your phone number at inreallife.io`,
      from: process.env.TWILIO_PROD_NUMBER,
      to: foundUser.phoneNumber
    });
    res.status(200).send({ response });
  } catch (error) {
    return res.status(206).send({ error });
  }
});

app.get("/response/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    let foundResponse = await Response.findOne({
      where: {
        id
      }
    });
    if (!foundResponse) {
      return res
        .send(206)
        .send({ error: `Response with id ${id} does not exist...` });
    }
    return res.status(200).send({ response: foundResponse });
  } catch (e) {
    return res.status(206).send({ error: err.message });
  }
});

// Compare the two user's responses and return a score object to the other phone

app.post("/compare", async (req, res, next) => {
  //Send websockets event
  const { fromUserId, toUserId, surveyId } = req.body;

  try {
    const fromResponse = await Response.findOne({
      where: { userId: fromUserId, surveyId }
    });
    if (!fromResponse) {
      return res.status(206).send({
        err: "From User has not yet created a response with surveyId ",
        surveyId
      });
      ``;
    }
    const allResponses = await Response.findAll({
      where: { userId: { [Op.not]: fromUserId }, surveyId: surveyId },
      raw: true
    });

    const allMatches = [];
    allResponses.forEach(response => {
      let result = compareTwoResponses(
        fromResponse.answersJson,
        response.answersJson
      );
      if (result) {
        allMatches.push({
          score: result.score,
          sharedAnswers: result.sharedAnswers,
          fromUserId,
          toUserId: response.userId
        });
      }
    });
    // Check if already scanned
    const existingInteraction = await Interaction.findOne({
      where: { fromUserId, toUserId, surveyId }
    });
    if (existingInteraction) {
      return res.status(200).send({
        rank: actualRank,
        totalPlayers,
        score,
        interactionId: existingInteraction.id,
        sharedAnswers
      });
    } else {
      // Determine rank, asbtract into util and refactor this
      const rankedMatches = _.sortBy(allMatches, ["score"]).reverse();
      const rank = _.findIndex(rankedMatches, { toUserId });
      const { score, sharedAnswers } = rankedMatches[rank];
      const totalPlayers = rankedMatches.length;
      const actualRank = rank + 1;

      const interaction = await Interaction.create({
        surveyId,
        fromUserId,
        toUserId,
        compatibilityScore: score
      });

      res.status(200).send({
        rank: actualRank,
        totalPlayers,
        score,
        sharedAnswers,
        interactionId: interaction.id,
        rankedMatches
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(206).send({ err });
  }
});
app.get("/interaction/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    let foundInteraction = await Interaction.findOne({
      where: {
        id
      }
    });
    console.log("Found Interaction~~", foundInteraction);
    if (!foundInteraction) {
      return res
        .send(206)
        .send({ error: `Interaction with id ${id} does not exist...` });
    }
    return res.status(200).send({ interaction: foundInteraction });
  } catch (e) {
    return res.status(206).send({ error: err.message });
  }
});

// app.put("/interaction", async (req, res) => {
//   const { id, questions } = req.body;
//   try {
//     let foundInteraction = await Interaction.update(questions, {
//       where: {
//         id
//       }
//     });
//     if (!foundInteraction) {
//       return res
//         .send(206)
//         .send({ error: `Interaction with id ${id} does not exist...` });
//     }

//     return res.status(200).send({ interaction: foundInteraction });
//   } catch (e) {
//     return res.status(206).send({ error: err.message });
//   }
// })

// WEB SOCKETS
const clients = {};

// Establish socket connection
io.on("connection", function(socket) {
  socket.on("STORE_USER_ID", function(data) {
    if (data.socketId && data.userId) {
      clients[data.userId] = data.socketId;
    }
  });

  //
  socket.on("COMPARE", async data => {
    const { scannedUserId, scanningUserId, surveyId } = data;
    if (
      isUUID(scannedUserId) &&
      isUUID(scanningUserId) &&
      clients[scannedUserId]
    ) {
      const scanningUser = await User.findOne({
        where: { id: scanningUserId },
        raw: true
      });
      const fromResponse = await Response.findOne({
        where: { userId: scannedUserId, surveyId }
      });
      const allResponses = await Response.findAll({
        where: { userId: { [Op.not]: scannedUserId }, surveyId: surveyId },
        raw: true
      });
      const allMatches = [];
      allResponses.forEach(response => {
        let result = compareTwoResponses(
          fromResponse.answersJson,
          response.answersJson
        );
        if (result) {
          allMatches.push({
            score: result.score,
            sharedAnswers: result.sharedAnswers,
            fromUserId: scannedUserId,
            toUserId: response.userId
          });
        }
      });
      const rankedMatches = _.sortBy(allMatches, ["score"]).reverse();
      const rank = _.findIndex(rankedMatches, { toUserId: scanningUserId });
      const { score, sharedAnswers } = rankedMatches[rank];
      const totalPlayers = rankedMatches.length;
      //Sends to one socket
      const actualRank = rank + 1;
      socket.to(clients[scannedUserId]).emit("SCANNED_YOU", {
        rank: actualRank,
        totalPlayers,
        score,
        sharedAnswers,
        scanningUser,
        eventType: "socket.to(id)"
      });
      let foundInteraction = await Interaction.findOne({
        where: {
          fromUserId: scanningUserId,
          toUserId: scannedUserId,
          surveyId
        }
      });
      if (!foundInteraction) {
        Interaction.create({
          surveyId,
          fromUserId,
          toUserId,
          compatibilityScore: score
        });
      }
    }
    socket.emit();
  });
});

server
  .listen(port, () => {
    console.log(`app listening on port ${port}`);
  })
  .on("error", err => {
    console.log("error on startup: ", err);
    process.exit();
  });

exports = module.exports = app;
