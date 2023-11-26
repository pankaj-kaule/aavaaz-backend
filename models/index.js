const Sequelize = require("sequelize");
const User = require("./user");
const Verification = require("./verification");
const Feedback = require("./feedback");

const host = "52.5.126.97";
const dbName = "awaaz";
const user = "estubank";
const password = "estubank04";
const dialect = "mysql";

// console.log('dbname',dbName);

const sequelize = new Sequelize(dbName, user, password, {
  host,
  dialect,
  pool: { max: 10, min: 0, idle: 10000 },
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connected with DB");
  })
  .catch((err) => {
    throw err;
  });

const aavaazDB = {};

aavaazDB.sequelize = sequelize;
aavaazDB.Sequelize = Sequelize;
aavaazDB.user = User(sequelize);
aavaazDB.verification = Verification(sequelize);
aavaazDB.feedback = Feedback(sequelize);

aavaazDB.sequelize
  .sync()
  .then(() => {
    console.log("Db Synced!");
  })
  .catch((err) => {
    throw err;
  });

module.exports = aavaazDB;
