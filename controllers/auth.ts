import { Request, Response, NextFunction } from "express";
import usersModel from "./../models/users";
import { RegisterBody, LoginBody } from "./../interfaces/auth";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import httpErrors from "http-errors";
import httpStatus from "http-status";
import banUserModel from "../models/banUser";
import {
  generateVerificationToken,
  sendConfirmationEmail,
  verifyEmail,
} from "../helpers/userVerification";
import accessToken from "../helpers/authToken";
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
      throw httpErrors.BadRequest("password is not valid");
    }

    const twoMonths = 60 * 60 * 24 * 60 * 1000;
    const authToken = accessToken(user._id, twoMonths);

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
    let { username, email, password } = req.body as RegisterBody;
    delete req.body.confirmPassword;
    const foundUser = await usersModel.findOne({
      $or: [{ email }, { username }],
    });

    if (foundUser) {
      throw httpErrors.Conflict("Username or email already exists");
    }
    password = bcrypt.hashSync(password, 10);
    const profile = req.file && req.file.filename;
    const emailToken = generateVerificationToken(<RegisterBody>{
      ...req.body,
      profile,
      password,
    });
    if (emailToken.error) {
      throw httpErrors("The token was created with an error");
    }
    const result = <any>sendConfirmationEmail(email, <string>emailToken.token);

    if (result?.error) {
      throw httpErrors(result.error || "The email was sent with an error");
    }

    res.json({ message: "Email sent Confirm email to login" });
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
export let confirmEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = <any>req.query.token;
    const userInfo = verifyEmail(token);

    if (userInfo.error) {
      throw httpErrors(
        userInfo.error.status || 400,
        userInfo.error.message || "Token error confirmation"
      );
    }

    const foundUser = await usersModel.findOne({ email: userInfo.email });

    if (foundUser) {
      throw httpErrors.Conflict("email already exists");
    }

    const users = await usersModel.find();

    const user = await usersModel.create({
      ...userInfo,
      isSuperAdmin: users.length == 0,
      isAdmin: users.length == 0,
      profile: userInfo.profile
        ? `/usersProfile/${userInfo.profile}`
        : "/usersProfile/customProfile.png",
    });
    const twoMonths = 60 * 60 * 24 * 60 * 1000;

    const authToken = accessToken(user._id, twoMonths);

    res.cookie("token", authToken, {
      maxAge: twoMonths,
      httpOnly: true,
      secure: true,
    });
    res
      .status(httpStatus.CREATED)
      .json({ message: "Registration was successful" });
  } catch (error) {
    next(error);
  }
};
