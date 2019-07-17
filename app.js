require("dotenv").config();
const express = require("express");
const app = express();
const expressWs = require("express-ws")(app);
const port = process.env.PORT || 4000;
const helmet = require("helmet");
const { Survey, User, Response, Interaction } = require("./models");
const { Op } = require("sequelize");
const models = require("./models/index");
models.sequelize.sync();

// Middleware
app.use(helmet());
app.use(require("./middlewares/BodyParser"));

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
      return res.sendStatus(206).json({
        error: "A user with that phone number or email already exists."
      });
    }
    const user = await User.create(userFields);
    console.log("Created User~~~", user);
    res.sendStatus(200).json(user);
  } catch (e) {
    console;
    return res.status(206).json({ error: e.message });
  }
});
app.put("/user/:id", async (req, res, next) => {
  if (!req.params.id) {
    res.status(206).json({ error: "User Id required in PUT request." });
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
    res.sendStatus(200).send(userData);
  } catch (e) {
    console;
    return res.status(200).send({ error: e.message });
  }
});

// Returns user data and response
app.get("/user/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!id) {
      return res.status(400).json({ error: "You must include a User Id" });
    }
    const userData = await User.findOne({
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
    console.log("User Data", userData.dataValues.Responses);
    res.sendStatus(200).json(userData);
  } catch (err) {
    return res.status(206).json({ error: err.message });
  }
});

app.post("/survey", async (req, res, next) => {
  const { surveyFields } = req.body;
  try {
    const idNumber = Math.floor(1000 + Math.random() * 9000);
    const survey = await Survey.create({ idNumber, ...surveyFields });
    console.log("Created survey~", survey);
    return res.sendStatus(200).json(survey);
  } catch (e) {
    console.error("Error creating survey", e);
    //handle error
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
        .sendStatus(206)
        .json({ error: `Survey with id ${id} does not exist...` });
    }
    return res.sendStatus(200).json(foundSurvey);
  } catch (e) {
    console.error("Error creating response", e);
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
      res.sendStatus(206).json(existingResponse);
    }
    const response = await Response.create(responseFields);
    console.log("Created Response~~", response);
    res.sendStatus(200).json(response);
  } catch (e) {
    console.error("Error creating response~~", e);
    //handle error
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
    console.log("Found Response~~", foundResponse);
    if (!foundResponse) {
      return res
        .sendStatus(206)
        .json({ error: `Response with id ${id} does not exist...` });
    }
    return res.sendStatus(200).json(foundResponse);
  } catch (e) {
    console.error("Error creating response", e);
  }
});

// Compare the two user's responses and return a score object + the follow up questionsJson
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

    res.sendStatus(200).json(interaction);
    // WS updates sent here
  } catch (e) {
    console.error(e);
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
        .sendStatus(206)
        .json({ error: `Interaction with id ${id} does not exist...` });
    }
    return res.sendStatus(200).json(foundInteraction);
  } catch (e) {
    console.error("Error creating Interaction", e);
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
