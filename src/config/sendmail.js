require("dotenv").config();
const nodemailer = require("nodemailer");
const engine = require("express-handlebars");

// create instance for handlebar
const hbs = engine.create({
  extname: ".hbs",
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// Send verification email OTP
const sendOTPCode = async ({ to, username, otpCode }) => {
  to = to || process.env.EMAIL_USER;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "BUGHOUSE OTP Verification Email",
    html: await hbs.render("./src/template/otp_confirm.hbs", {
      otpCode,
      username,
      clientDomain: "https://peguinhouse.onrender.com/bh",
    }),
    attachments: [
      {
        filename: "ladybug.png",
        path: "./src/resource/icon/ladybug.png",
        cid: "logo_image",
      },
    ],
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) console.log(err);
    else {
      console.log("OTP Email send:", info.response);
    }
  });
};

module.exports = sendOTPCode;
