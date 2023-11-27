const { createTransport } = require("nodemailer");

const transporter = createTransport({
  host: "smtp-relay.sendinblue.com",
  port: 587,
  auth: {
    user: "shuklasarthak100@gmail.com",
    pass: "xsmtpsib-4586f4e6a40d30a2394d85a734bf191e391c8f9d5750b8cf5223e4394f7d3477-U6ZDBh2HYFIkOvTw",
  },
});

exports.sendEmail = async (email, otp) => {
  const mailOptions = {
    from: "shuklasarthak100@gmail.com",
    to: email,
    subject: `Aavaaz Verification Email`,
    text: `Your otp is ${otp}`,
  };
  return await transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return {
        message: "error",
        data: null,
      };
    } else {
      return {
        message: "success",
        data: info.response,
      };
    }
  });
};
// sendEmail("sarthak13fractal@gmail.com", "123456");
