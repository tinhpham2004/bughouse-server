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
        user: process.env.OUR_EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const sendVerify = async ({to, username, token}) => {
    to = to || "giangvo0206@gmail.com";
    const mailOptions = {
        from: process.env.OUR_EMAIL,
        to,
        subject: "BUGHOUSE Verification Email",
        html: await hbs.render("./src/template/verify_mail.hbs", {
            token,
            username,
            clientDomain: "https://peguinhouse.onrender.com/bh",
        }),
        attachments: [
            {
                filename: "hinh1.jpg",
                path: "",
                cid: "logo_image",
            },
        ],
    };
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) console.log(err);
        else console.log("Email send:", info.response);
    });
};

const sendNotify = async ({to, inMonth, inYear, name}) => {
    const mailOptions = {
        from: process.env.OUR_EMAIL,
        to,
        subject: "BUGHOUSE Service Demand Is Available",
        html: await hbs.render("./src/template/welcome_mail.hbs", {
            inMonth,
            inYear,
            name,
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
        else console.log("Email send:", info.response);
    });
};

module.exports = {sendVerify, sendNotify};
