require("dotenv").config();
const Sequelize = require("sequelize");

let sequelize;

const loggingOpts = {
  0: false,
  1: console.log
  // other levels can define custom functions as needed
};

if (process.env.NODE_ENV === "local") {
  sequelize = new Sequelize({
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    dialect: "postgres",
    port: "5432"
  });
  // sequelize = new Sequelize(process.env.DATABASE_URL, {
  //   dialect: "postgres",
  //   operatorsAliases: false,
  //   logging: loggingOpts[process.env.SEQUELIZE_LOGGING || 0],
  //   protocol: "postgres",
  //   dialectOptions: {
  //     ssl: true,
  //     statement_timeout: 5000
  //   },
  //   define: {
  //     paranoid: true
  //   }
  // });
} else {
  console.log("Reached");
  sequelize = new Sequelize(process.env.POSTGRES_URL, {
    dialect: "postgres",
    operatorsAliases: false,
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

sequelize
  .authenticate() //{ username: process.env.POSTGRES_USER, password: process.env.POSTGRES_PW }
  .then(function(err) {
    console.log("DB Connection has been established :D");
  })
  .catch(function(err) {
    console.log("Unable to connect to the database:", err);
  });

module.exports = sequelize;
