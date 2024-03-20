import { Request, Response, NextFunction } from "express";
import usersModel from "./../models/users";
import { RegisterBody, LoginBody } from "./../interfaces/auth";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import httpErrors from "http-errors";
import banUserModel from "../models/banUser";
import { sendMail } from "../helpers/sendMail";
import generateToken from "../helpers/generateToken";
import tokenModel from "../models/token";
import { randomBytes } from "crypto";
import { isValidObjectId } from "mongoose";
dotenv.config();
export let login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { identifier, password } = req.body as LoginBody;

    const user = await usersModel.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      throw httpErrors.NotFound("username or email not found");
    }

    const banUser = await banUserModel.findOne({ email: user.email });
    if (banUser) {
      throw httpErrors.Forbidden("You are banned, you cannot login");
    }

    const checkPassword = bcrypt.compareSync(password, user.password);

    if (!checkPassword) {
      throw httpErrors.BadRequest("Email or password is not valid");
    }

    if (!user.isVerified) {
      const token = await tokenModel.findOne({ userId: user._id });
      if (token) {
        throw httpErrors.Conflict("Token already exists. Try again in 1 hour");
      } else {
        const token = await tokenModel.create({
          userId: user._id,
          token: randomBytes(32).toString("hex"),
        });

        const url = `${process.env.BASE_URL}/v1/auth/${user._id}/verify/${token.token}`;

        const mailOptions = {
          from: process.env.GMAIL_USER as string,
          to: user.email,
          subject: "Email confirmation",
          html: `<p>Click on the link below to confirm the email:</p>
       <h1>${url}</h1>
       `,
          userId: user._id,
        };

        const result: any = await sendMail(mailOptions);

        if (result?.error) {
          throw result.error;
        }
      }
      return res.json({
        message: "An email sent to your account please verify",
      });
    }

    const twoMonths = 60 * 60 * 24 * 60 * 1000;
    const authToken = generateToken(user._id, twoMonths);

    res.cookie("token", authToken, {
      secure: true,
      httpOnly: true,
      maxAge: twoMonths,
    });
    res.json({ message: "You have successfully logged in" });
  } catch (error) {
    next(error);
  }
};
export let register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password } = req.body as RegisterBody;
    delete req.body.confirmPassword;
    const foundUser = await usersModel.findOne({
      $or: [{ email }, { username }],
    });

    if (foundUser) {
      throw httpErrors.Conflict("Username or email already exists");
    }

    const hashPassword = bcrypt.hashSync(password, 10);
    const countUsers = await usersModel.countDocuments().lean();

    const newUser = await usersModel.create({
      ...req.body,
      profile: "/usersProfile/customProfile.png",
      password: hashPassword,
      isAdmin: countUsers == 0,
      isSuperAdmin: countUsers == 0,
    });

    const token = await tokenModel.create({
      userId: newUser._id,
      token: randomBytes(32).toString("hex"),
    });

    const url = `${process.env.BASE_URL}/v1/auth/${newUser._id}/verify/${token.token}`;

    const mailOptions = {
      from: process.env.GMAIL_USER as string,
      to: email,
      subject: "Email confirmation",
      html: `<p>Click on the link below to confirm the email:</p>
       <h1>${url}</h1>
       `,
      userId: newUser._id,
    };

    const error: any = await sendMail(mailOptions);

    if (error) throw error;

    res.json({ message: "An email sent to your account please verify" });
  } catch (error) {
    next(error);
  }
};
export let logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie("token");
    res.json({ message: "You have successfully logged out" });
  } catch (error) {
    next(error);
  }
};
export let forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    const user = await usersModel.findOne({ email });

    if (!user) {
      throw httpErrors.NotFound("User with email not found");
    }

    const token = await tokenModel.create({
      userId: user._id,
      token: randomBytes(32).toString("hex"),
    });

    const mailOptions = {
      from: process.env.GMAIL_USER as string,
      to: email,
      subject: "reset your password",
      html: `<p>Link to reset your password:</p>
      <h1>Click on the link below to reset your password</h1>
      <h2>${process.env.BASE_URL}/v1/auth/${user._id}/reset-password/${token.token}</h2>
       `,
    };

    const result: any = sendMail(mailOptions);

    if (result?.error) throw result.error;

    res.json({
      message: "The password reset link has been sent to your email",
    });
  } catch (error) {
    next(error);
  }
};
export let resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, token } = req.params;
    const { password } = req.body;

    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("User id is not from mongodb");
    }

    if (!password || password < 8) {
      throw httpErrors.BadRequest(
        "Password is required and must not be less than 8 characters"
      );
    }

    const user = await usersModel.findById(id);

    if (!user) {
      throw httpErrors.NotFound("User not found");
    }

    const userToken = await tokenModel.findOne({ userId: id, token });

    if (!userToken) {
      throw httpErrors.NotFound("Invalid token");
    }

    const hashPassword = bcrypt.hashSync(password, 10);

    await user.updateOne({
      password: hashPassword,
    });

    await userToken.deleteOne();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
};
export let verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, token } = req.params;

    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("User id is not from mongodb");
    }

    const user = await usersModel.findById(id);
    if (!user) {
      throw httpErrors.NotFound("User not found");
    }

    const userToken = await tokenModel.findOne({
      userId: id,
      token,
    });

    if (!userToken) {
      throw httpErrors.BadRequest("Invalid token");
    }

    await user.updateOne({ isVerified: true });
    await userToken.deleteOne();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    next(error);
  }
};
