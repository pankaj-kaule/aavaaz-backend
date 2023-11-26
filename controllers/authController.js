const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");
const db = require("../models/index");
const { QueryTypes, json } = require("sequelize");

exports.protect = catchAsync(async (req, res, next) => {
  // 1)Getting token and check if it exist

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  // console.log(token);
  if (!token) {
    return next(
      new AppError("You are Not logged In! Please log in to get access", 401)
    );
  }

  // 2)Verification token
  console.log(token);
  console.log(process.env.JWT_SECRET);
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);
  // 3)Check if user still exist
  const query = `select * from users where id = ${decoded.id};`;

  let currentUser = await db.sequelize.query(query, {
    type: QueryTypes.SELECT,
  });

  console.log("aryan", currentUser);
  if (currentUser.length === 0) {
    return next(
      new AppError("The user belonging to this token does no longer exist", 401)
    );
  }
  currentUser = currentUser[0];
  // GRANT ACCESS TO PROTECTED ROUTES
  req.user = currentUser;
  next();
});
