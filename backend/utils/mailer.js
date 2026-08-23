const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendMail = ({ to, subject, text }) => {
  transporter.sendMail({ from: process.env.SMTP_MAIL, to, subject, text }, (err) => {
    if (err) console.error(`Error sending email to ${to}:`, err);
  });
};

module.exports = { transporter, sendMail };
