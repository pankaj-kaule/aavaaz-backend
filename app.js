const path = require("path");
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");
const mainRouter = require("./routes/index");

const app = express();

// Set Security Http Headers
// app.use(helmet());

// Development Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//To fix cors issues
app.use(cors());

//To parse cookies
app.use(cookieParser());

// // 100 request from same IP in 1 hour
// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: 'Too many requests from this IP,please try again in an Hour',
// });
// app.use('/api', limiter);

// Body Parser reading data from body into req.body
app.use(express.json());

// Data sanitization against NoSQL query injection

// Data sanitization against XSS
// Clean user input from html and js code
// app.use(xss());

// Prevent parameter pollution
// app.use(
//   hpp({
//     whitelist: [
//       "duration",
//       "ratingsQuantity",
//       "ratingsAverage",
//       "maxGroupSize",
//       "difficulty",
//       "price",
//     ],
//   })
// );

// Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// Mounting the Rounters
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      data: "Welcome to the Aavaz Backend System",
    },
  });
});

// Setup all Routers
app.use("/api/v1", mainRouter);

// Middle Ware to throw error if the router does not exist

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this Server!`, 404));
});

// Global Error Handling Middleware
app.use(globalErrorHandler);
module.exports = app;
