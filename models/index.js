"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const db = {};
const sequelize = require("../middlewares/Sequelize");

fs.readdirSync(__dirname)
  .filter(file => {
    console.log(
      "filtering~~~",
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach(file => {
    const model = sequelize["import"](path.join(__dirname, file));
    console.log("forEACH~~~", model.name);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  console.log("forEach2~~~", modelName);
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
