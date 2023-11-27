const catchAsync = require("./../utils/catchAsync");
const db = require("../models/index");
const User = require("../models/user");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const { Configuration, OpenAIApi, OpenAI } = require("openai");
const axios = require("axios");
const FormData = require("form-data");
const AppError = require("./../utils/appError");
const { QueryTypes, json } = require("sequelize");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const AWS = require("aws-sdk");
const crypto = require("crypto");
const s3 = new AWS.S3({
  accessKeyId: "AKIAVOC43IYT4MKHIONP",
  secretAccessKey: "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",
  region: "us-east-1",
});
// const ffmpeg = require("fluent-ffmpeg");
// const { Readable } = require("stream");

// const ffmpeg = require("fluent-ffmpeg");
// const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;

// // Set the path to the FFmpeg binary
// ffmpeg.setFfmpegPath(ffmpegPath);

// const axios = require('axios');
// const { validationResult } = require('express-validator');
const jwt = require("jsonwebtoken");
const openai = new OpenAI({
  apiKey: `${process.env.OPENAI_APIKEY}`,
});

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  // user=user[0];
  console.log(user.id);
  const token = signToken(user.id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // Remove password from output but will not from database
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = async (req, res, next) => {
  let email = req.body.email;
  const query = `select * from users where email='${email}';`;

  const user = await db.sequelize.query(query, {
    type: QueryTypes.SELECT,
  });
  // const user = await User.findOne({ email });
  console.log(user);
  if (user.length > 0) {
    return next(new AppError("User with is already exist", 200));
  }
  req.body.password = await bcrypt.hash(req.body.password, 12);
  console.log(req.body.password);
  let newUser = await db.user.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    organization: req.body.organization,
  });
  console.log(newUser);
  // return;
  createSendToken(newUser.dataValues, 201, res);
};

exports.login = catchAsync(async (req, res, next) => {
  // return res.status(200).json({
  //   status: "success",
  // });
  console.log("sarthak");
  const { email, password } = req.body;
  // 1)Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }
  // 2)Check if user exists and password is correct
  const query = `select * from users where email='${email}';`;

  console.log("sarthak");
  let user = await db.sequelize.query(query, {
    type: QueryTypes.SELECT,
  });

  console.log(user);
  // const user = await User.findOne({ email }).select("+password");
  if (
    user.length === 0 ||
    !(await bcrypt.compare(password, user[0].password))
  ) {
    return next(new AppError("Incorrect email or password", 401));
  }
  //   // 3)If everything ok,send token to the client
  user = user[0];
  createSendToken(user, 200, res);
});

const languageConverter = async (text, toLang) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Translate the following text to ${toLang}:
        
                  ${text}
                  `,
        },
      ],
      model: "gpt-3.5-turbo",
    });

    if (
      completion?.choices &&
      Array.isArray(completion.choices) &&
      completion.choices[0]?.message?.content
    )
      return {
        status: "success",
        data: completion.choices[0].message.content,
      };
    else {
      return {
        status: "error",
        data: null,
      };
    }
  } catch (err) {
    console.log(err);
    return {
      status: "error",
      data: null,
    };
  }
};
const textToSpeech = async (text, lang) => {
  // const { text } = req.body;
  const localfilepath = "./temp.mp3";
  console.log("aryan text", text);
  if (!text) {
    return "Please provide text to process";
  }

  // return text;
  const result = await languageConverter(text, lang);
  // return result;
  console.log(result);
  if (result.status === "error") {
    console.log(result);
    return "There is some issue converting text to Speech";
  } else {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });
    console.log("aryan mp3", mp3);
    return mp3.body;
  }
};

const speechToText = async (lang, file) => {
  // Replace with Multer
  console.log("aryan", file);
  const filePath = file.path;
  console.log(filePath);
  const model = "whisper-1";

  const formData = new FormData();
  formData.append("model", model);
  formData.append("file", fs.createReadStream(filePath), {
    contentType: "audio/mp3",
  });
  console.log("aryan", process.env.OPENAI_APIKEY);
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_APIKEY}`,
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
        },
      }
    );
    // console.log(response);

    const data = response.data.text;

    // Process the data or return it as needed
    return data;
  } catch (error) {
    console.error(error.response.data);
    return "There is some issue converting speech to text";
    // You can throw the error or handle it as needed
    // throw new Error("There is some issue converting speech to text");
  }
};
exports.textToText = catchAsync(async (req, res, next) => {
  const { text, toLang } = req.body;

  if (!text && !toLang) {
    return next(new AppError("Please provide required details", 400));
  }

  const result = await languageConverter(text, toLang);

  if (result.status === "success") {
    return res.status(200).json({
      status: "success",
      text: result.data,
    });
  } else {
    return res.status(400).json({
      status: "error",
      message: "There is some issue translating the text",
    });
  }
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const { name, role, organization } = req.body;

  const userId = req.user.id;

  const query = `UPDATE users
  SET name = '${name}',
      role = '${role}',
      organization = '${organization}'
  WHERE id = ${userId};`;

  const user = await db.sequelize.query(query, {
    type: QueryTypes.UPDATE,
  });

  res.status(200).json({
    status: "success",
  });
});

exports.verifyOtp = catchAsync(async (req, res, next) => {
  const { otp, verificationId } = req.body;

  let query = `select * from verifications where id = ${verificationId}`;
  let verify = await db.sequelize.query(query, {
    type: QueryTypes.SELECT,
  });

  if (verify.length === 0) {
    return next(new AppError("Unauthorize", 400));
  }
  console.log(verify[0].otp, otp);
  if (verify[0].otp != otp) {
    return next(new AppError("OTP is Not correct", 401));
  }

  res.status(200).json({
    status: "success",
  });
});

const uploadToS3 = async (
  res,
  destinationAudio,
  sourceText,
  destinationText
) => {
  const randomFilename = crypto.randomBytes(16).toString("hex") + ".mp3";

  // Upload the MP3 stream to S3 with the random filename
  const s3UploadParams = {
    Bucket: "stage-bucket-estu",
    Key: `${randomFilename}`,
    Body: destinationAudio,
  };

  try {
    const s3UploadResult = await s3.upload(s3UploadParams).promise();
    console.log("File uploaded to S3:", s3UploadResult);
    res.status(200).json({
      status: "success",
      // fromLang,
      // toLang
      sourceText,
      destinationText,
      destinationAudio: `https://d26kwelnugwjcg.cloudfront.net/${s3UploadResult.key}`,
    });
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    res.status(500).json({
      status: "error",
    });
  }
};

exports.sendOtp = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const otp = String(Math.floor(1000 + Math.random() * 9000));
  let data = JSON.stringify({
    to: `${email}`,
    subject: "Awaaz OTP",
    text: `Your OTP is ${otp}`,
  });
  console.log(process.env.EMAIL_SERVICE_URL);
  console.log(data);
  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${process.env.EMAIL_SERVICE_URL}send-email`,
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };

  const verify = await db.verification.create({
    email: req.body.email,
    otp,
  });

  try {
    const response = await axios.request(config);
    console.log(`OTP sent successfully ${otp}`);
    res.status(200).json({
      status: "success",
      verificationId: verify.id,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: "error",
    });
  }
});

exports.mic = catchAsync(async (req, res, next) => {
  const { fromLang, toLang } = req.body;
  console.log(req.file);
  if (!req.file && !req.body.sourceText) {
    return next(new AppError("Please provide required details", 400));
  } else if (req.file) {
    const sourceText = await speechToText(fromLang, req.file);
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      } else {
        console.log("File deleted successfully:", req.file.path);
      }
    });
    console.log("aryan123", sourceText);
    let destinationText = await languageConverter(sourceText, toLang);
    // console.log('aryan123',destinationText);
    destinationText = destinationText.data;
    const destinationAudio = await textToSpeech(destinationText, toLang);
    uploadToS3(res, destinationAudio, sourceText, destinationText);
    // const speechFile = path.resolve("./speech.mp3");

    // const buffer = Buffer.from(await destinationAudio.arrayBuffer());
    // await fs.promises.writeFile(speechFile, buffer);
  } else {
    let destinationText = await languageConverter(req.body.sourceText, toLang);
    destinationText = destinationText.data;
    const destinationAudio = await textToSpeech(destinationText, toLang);
    const randomFilename = crypto.randomBytes(16).toString("hex") + ".mp3";

    // Upload the MP3 stream to S3 with the random filename
    const s3UploadParams = {
      Bucket: "stage-bucket-estu",
      Key: `${randomFilename}`,
      Body: destinationAudio,
    };

    try {
      const s3UploadResult = await s3.upload(s3UploadParams).promise();
      console.log("File uploaded to S3:", s3UploadResult);
      res.status(200).json({
        status: "success",
        destinationText,
        destinationAudio: `https://d26kwelnugwjcg.cloudfront.net/${s3UploadResult.key}`,
      });
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      res.status(500).json({
        status: "error",
      });
    }
  }
});

exports.feedback = catchAsync(async (req, res, next) => {
  const { clinicalError, translationalError, message } = req.body;
  const userId = req.user.id;
  let data = await db.feedback.create({
    clinicalError: clinicalError,
    translationalError: translationalError,
    message: message,
    userId: userId,
  });
  res.status(200).json({
    status: "success",
  });
});
