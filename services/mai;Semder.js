import otpGenerator from "otp-generator";
import nodemailer from "nodemailer";
import fs from "fs";
import inlineCss from "inline-css";
// import { url } from 'inspector'

export const mailSender = async (email, otp, otp_type) => {
  let htmlContent = fs.readFileSync("otp_template.html", "utf-8");
  htmlContent = htmlContent.replace("TradingApp_otp", otp);
  htmlContent = htmlContent.replace("TradingApp_otp2", otp_type);

  const option = {
    url: " ",
  };

  htmlContent = await inlineCss(htmlContent, option);

  try {
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    let result = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: "Trading App - OTP Verification",
      html: htmlContent,
    });

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
