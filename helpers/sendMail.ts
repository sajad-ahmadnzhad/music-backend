import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { SendMailOptions } from "../interfaces/auth";
dotenv.config();

export let sendMail = async (mailOptions: SendMailOptions) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 465,
      secure: true,
      logger: true,
      debug: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    transporter.sendMail(mailOptions);
  } catch (error) {
    return { error };
  }
};
