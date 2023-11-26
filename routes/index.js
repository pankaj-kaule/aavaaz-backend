/* eslint-disable */
const express = require("express");
const mainController = require("../controllers/mainController");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' })
const router = express.Router();

router.post("/signup", mainController.signup);

router.post("/login", mainController.login);

router.post("/send-otp",mainController.sendOtp);

router.post("/verify-otp",mainController.verifyOtp);

router.use(require('../controllers/authController').protect);

router.post("/mic", upload.single('file'), mainController.mic);

// router.post("/speechToText", upload.single('file'), mainController.speechToText);

// router.post("/textToText", mainController.textToText);

router.post("/update-profile", mainController.updateProfile)

router.post("/feedback",mainController.feedback)

module.exports = router;
