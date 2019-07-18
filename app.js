require("dotenv").config();
const express = require("express");
const app = express();
const expressWs = require("express-ws")(app);
const port = process.env.PORT || 4000;
const helmet = require("helmet");
const { Survey, User, Response, Interaction } = require("./models");
const { Op } = require("sequelize");
const models = require("./models/index");
var Twilio = require("twilio");
const twilioClient = new Twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_TEST_TOKEN
);
models.sequelize.sync({ force: true });
// Middleware
app.use(helmet());
app.use(require("./middlewares/BodyParser"));

app.get("/", (req, res, next) => {
  res.status(200).send("hello jon");
});
// User Routes
app.post("/user", async (req, res, next) => {
  const { userFields } = req.body;
  try {
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          {
            email: {
              [Op.iLike]: userFields.email
            }
          },
          {
            phoneNumber: {
              [Op.iLike]: userFields.phoneNumber
            }
          }
        ]
      }
    });
    console.log("Existing User~~~", existingUser);
    if (existingUser) {
      return res.status(206).send({
        error: "A user with that phone number or email already exists."
      });
    }
    const user = await User.create(userFields);
    console.log("Created User~~~", user);
    res.status(200).send({ user });
  } catch (e) {
    return res.status(206).send({ error: e.message });
  }
});
app.put("/user/:id", async (req, res, next) => {
  if (!req.params.id) {
    res.status(206).send({ error: "User Id required in PUT request." });
  }
  try {
    const { userFields } = req.body;
    let updatedUser = await User.update(userFields, {
      where: { id: req.params.id }
      //Add an include here, reduce to one call
    });
    console.log("Updated User", updatedUser[0]);
    const userData = await User.findOne({
      where: { id: req.params.id },
      include: [{ model: Response, as: "Responses" }]
    });
    console.log("Updated User Data~ ", userData);
    res.status(200).send({ user: userData });
  } catch (e) {
    return res.status(200).send({ error: e.message });
  }
});

app.post("/sendMessage", async (req, res, next) => {
  console.log("sending message....", twilioClient.messages);
  try {
    let message = await twilioClient.messages.create({
      body: "Find your match?",
      from: process.env.TWILIO_NUMBER,
      to: "+18137657071"
    });
    console.log("Message~~~~~~~~~~~~~~", message.sid);
    return res.status(200).send({ message });
  } catch (err) {
    res.status(206).send({ err });
  }
});
// Returns user data and response
app.get("/user/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!id) {
      return res.status(400).send({ error: "You must include a User Id" });
    }
    const foundUser = await User.findOne({
      where: { id },
      include: [
        {
          model: Response,
          as: "Responses",
          // attributes: [],
          where: {
            userId: id
          }
        }
      ]
    });
    if (foundUser) return res.status(200).send({ user: foundUser });
    else {
      res.status(200).send({ error: "No user exists" });
    }
  } catch (err) {
    return res.status(206).send({ error: err.message });
  }
});

app.get("/users", async (req, res, next) => {
  const users = await User.findAll({
    attributes: ["id", "firstName", "lastName", "phoneNumber"],
    raw: true
  });
  return res.status(200).send({ users });
});

app.post("/survey", async (req, res, next) => {
  const { surveyFields } = req.body;
  try {
    const idNumber = Math.floor(1000 + Math.random() * 9000);
    const survey = await Survey.create({ idNumber, ...surveyFields });
    console.log("Created survey~", survey);
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
      }
    });
    if (existingResponse) {
      console.log(
        "User has already submitted a response for this survey",
        existingResponse
      );
      res.status(206).send(existingResponse);
    }
    const response = await Response.create(responseFields);
    console.log("Created Response~~", response);
    res.status(200).send({ response });
  } catch (e) {
    console.error("Error creating response~~", e);
    return res.status(206).send({ error: err.message });
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

// Compare the two user's responses and return a score object + the follow up questionssend
app.post("/compare", async (req, res, next) => {
  const {
    surveyId,
    fromUserId,
    toUserId,
    compatibilityScore, // Should this be on the frontend?
    question1,
    question2,
    question3,
    question4
  } = req.params;
  try {
    const fromUserResponse = await Response.findOne({
      where: {
        surveyId,
        userId: fromUserId
      }
    });
    console.log("fromUserResponse", fromUserResponse.dataValues);
    const toUserResponse = await Response.findOne({
      where: {
        surveyId,
        userId: toUserId
      }
    });
    console.log("toUserResponse", toUserResponse.dataValues);
    console.log(
      `User 1 Response ${fromUserResponse} \n User 2 Response ${toUserResponse}`
    );

    const interaction = await Interaction.create({
      surveyId,
      fromUserId,
      toUserId,
      compatibilityScore,
      question1,
      question2,
      question3,
      question4
    });

    res.status(200).send({ interaction });
    // WS updates sent here
  } catch (e) {
    return res.status(206).send({ error: err.message });
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

app
  .listen(port, () => {
    console.log(`app listening on port ${port}`);
  })
  .on("error", err => {
    console.log("error on startup: ", err);
    process.exit();
  });

exports = module.exports = app;
