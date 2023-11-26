/* eslint-disable */
const dotenv = require("dotenv");

// Catching uncaught Exceptions [by sync functions]
process.on("uncaughtException", (err) => {
  console.log("Uncaught Exceptions! Shutting Down");
  console.log(err.name, err.message);
  process.exit(1);
});
dotenv.config({ path: "config.env" });

const app = require("./app");

// Starting the Server
const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`App running on Port ${port}...`);
});

// just for temp push

// Catching unhandled Rejections [by async functions]
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
