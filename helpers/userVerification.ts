import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { RegisterBody } from "../interfaces/auth";
import nodemailer from "nodemailer";
dotenv.config();

export let sendConfirmationEmail = async (email: string, token: string) => {
  try {
    const confirmationLink = process.env.BASE_URL + token;

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

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Email confirmation",
      html: `<p>Please click on the link below to verify your email:</p>
    <a href="${confirmationLink}">Click to confirm the email</a>`,
    };
    transporter.sendMail(mailOptions);
  } catch (error: any) {
    return { error };
  }
};

export let verifyEmail = (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    const userInfo = decoded as any;
    return userInfo;
  } catch (error: any) {
    return { error };
  }
};

export let generateVerificationToken = (userInfo: RegisterBody) => {
  try {
    const token = jwt.sign(userInfo, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });
    return { token };
  } catch (error: any) {
    return { error };
  }
};
