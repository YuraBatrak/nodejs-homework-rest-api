const nodemailer = require("nodemailer");
require("dotenv").config();

const { META_PASSWORD } = process.env;

const nodemailerConfig = {
  host: "smtp.meta.ua",
  port: 465,
  secure: true,
  auth: {
    user: "yurabatrak@gmail.com",
    pass: META_PASSWORD,
  },
};

const transporter = nodemailer.createTransport(nodemailerConfig);

const mail = {
  to: "tajaye4021@akapple.com",
  from: "yurabatrak@gmail.com",
  subject: "Новое письмо с сайта",
  html: "<h2>Новый заказ с сайта</h2>",
};

transporter
  .sendMail(mail)
  .then(() => console.log("Email send success"))
  .catch((error) => console.log(error.message));
module.exports = transporter;
