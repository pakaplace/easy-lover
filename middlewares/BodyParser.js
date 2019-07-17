const bodyParser = require("body-parser");

module.exports = [
  bodyParser.json({ limit: "16mb" }),
  bodyParser.urlencoded({ extended: true })
];
