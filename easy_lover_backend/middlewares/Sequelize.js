require("dotenv").config();
const Sequelize = require("sequelize");

let sequelize;

const loggingOpts = {
  0: false,
  1: console.log
  // other levels can define custom functions as needed
};

if (process.env.NODE_ENV === "test") {
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
} else {
  console.log("should be reached");
  sequelize = new Sequelize({
    // username: process.env.POSTGRES_USER,
    // password: process.env.POSTGRES_PW,
    // database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    dialect: "postgres"
    // port: process.env.POSTGRES_PORT || "5432",
    // operatorsAliases: false,
    // logging: loggingOpts[process.env.SEQUELIZE_LOGGING || 0]
    // dialectOptions: {
    //   statement_timeout: 10000
    // },
    // define: {
    //   paranoid: true
    // }
  });
}

console.log(
  "Sequelize ",
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PW,
  process.env.POSTGRES_DB,
  process.env.POSTGRES_HOST
);
sequelize
  .authenticate() //{ username: process.env.POSTGRES_USER, password: process.env.POSTGRES_PW }
  .then(function(err) {
    console.log("Connection has been established successfully.");
  })
  .catch(function(err) {
    console.log("Unable to connect to the database:", err);
  });

module.exports = sequelize;
