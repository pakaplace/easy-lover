const express = require("express");
const app = express();
const expressWs = require("express-ws")(app);
var router = express.Router();
const port = process.env.PORT || 4000;
const helmet = require("helmet");
const { Survey, User, Response } = require("./models");
const { Op } = require("sequelize");

require("dotenv").config();

const models = require("./models/index");

models.sequelize.sync({ force: true });

app.use(helmet());
app.use(require("./middlewares/BodyParser"));

// app.use(function(req, res, next) {
//   console.log("middleware");
//   req.testing = "testing";
//   return next();
// });

app.post("/user", async function(req, res, next) {
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

app.put("/user/:id", async function(req, res, next) {
  console.log("User params~~~", req.params);

  if (!req.params.id) {
    res.status(206).json({ error: "User Id required in PUT request." });
  }
  // if (!User.verifyId(req.params.id)) {
  //   return res.status(206).json({ error: "userId must be a valid UUID" });
  // }
  try {
    const { userFields } = req.body;
    console.log("User params~~~", req.params);
    let updatedUser = await User.update(userFields, {
      where: { id: req.params.id }
    });
    console.log("Updated User", updatedUser[0]);
    const userData = await User.findOne({
      // eslint-disable-line
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
app.get("/user", async function(req, res, next) {
  try {
    // if(!req.params.id){
    //   return res.status(400).json({error: "You mu"})
    // }
    if (!User.verifyId(req.params.id)) {
      return res.status(206).json({ error: "userId must be a valid UUID" });
    }
    if (!user) {
      return res.status(400).json({ error: "User doesn't exist" });
    }

    const userData = await User.find({
      // eslint-disable-line
      where: { id: req.params.id },
      include: [{ model: Response, as: "Response" }]
    });
    res.sendStatus(200).json(userData);
  } catch (err) {
    return res.status(206).json({ error: e.message });
  }
});

app.get("/survey", function(req, res, next) {
  console.log("get route", req.testing);
  res.end();
});

app.ws("/echo", function(ws, req) {
  ws.on("message", function(msg) {
    console.log(msg);
  });
  console.log("socket", req.testing);
});

router.ws("/echo1", function(ws, req) {
  ws.on("message", function(msg) {
    console.log(msg);
  });
  console.log("socket", req.testing);
});

app
  .listen(port, () => {
    console.log(`app listening on port ${port}`);
  })
  .on("error", err => {
    console.log("error on startup: ", err);
    process.exit();
  });

exports = module.exports = app; // eslint-disable-line no-multi-assign
