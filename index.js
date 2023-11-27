const { createTransport } = require("nodemailer");

const transporter = createTransport({
  host: "smtp-relay.sendinblue.com",
  port: 587,
  auth: {
    user: "shuklasarthak100@gmail.com",
    pass: process.env.SEND_IN_BLUE,
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
      console.log(error);
      return {
        message: "error",
        data: null,
      };
    } else {
      console.log(info.response);
      return {
        message: "success",
        data: info.response,
      };
    }
  });
};
// sendEmail("sarthak13fractal@gmail.com", "123456");
