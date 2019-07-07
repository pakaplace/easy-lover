const express = require("express");
const app = express();
const expressWs = require("express-ws")(app);
var router = express.Router();
const port = process.env.PORT || 4000;
const helmet = require("helmet");

require("dotenv").load();
const Sequelize = require("sequelize");

let sequelize;

const loggingOpts = {
  0: false,
  1: console.log
  // other levels can define custom functions as needed
};

if (process.env.NODE_ENV === "test") {
  console.log("Reached test node env");
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    operatorsAliases: false,
    logging: loggingOpts[process.env.SEQUELIZE_LOGGING || 0],
    protocol: "postgres",
    dialectOptions: {
      ssl: true,
      statement_timeout: 5000
    },
    define: {
      paranoid: true
    }
  });
}
app.use(helmet());

app.use(function(req, res, next) {
  console.log("middleware");
  req.testing = "testing";
  return next();
});

app.get("/", function(req, res, next) {
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
