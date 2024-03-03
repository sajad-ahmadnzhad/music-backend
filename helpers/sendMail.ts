import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { SendMailOptions } from "../interfaces/auth";
import tokenModel from "../models/token";
dotenv.config();

export let sendMail = async (mailOptions: SendMailOptions) => {
  try {
    const { userId, ...options } = mailOptions;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 578,
      secure: false,
      logger: true,
      debug: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    transporter.sendMail(options, async (error) => {
      if (error) {
        console.log(error);
        return await tokenModel.findOneAndDelete({
          userId: mailOptions.userId,
        });
      }
    });
  } catch (error) {
    return { error };
  }
};
