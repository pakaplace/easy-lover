const express = require("express");
const app = express();
const expressWs = require("express-ws")(app);
var router = express.Router();
const port = process.env.PORT || 4000;
const helmet = require("helmet");

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
