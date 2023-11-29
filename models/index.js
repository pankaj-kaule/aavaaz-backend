const Sequelize = require("sequelize");
const User = require("./user");
const Verification = require("./verification");
const Feedback = require("./feedback");

const host = process.env.DB_HOST;
const dbName = process.env.DATABASE_NAME;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const dialect = process.env.DB_DIALECT;

// console.log('dbname',dbName);

const sequelize = new Sequelize('estuSqlDb', 'emaster', 'Estu@1234', {
  host: 'estymysql.database.windows.net',
  dialect: 'mssql',
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
