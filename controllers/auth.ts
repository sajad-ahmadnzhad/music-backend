import express from "express";
import usersModel from "./../models/users";
import { RegisterBody, LoginBody } from "./../interfaces/auth";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import httpStatus from "http-status";
dotenv.config();
export let login = async (req: express.Request, res: express.Response) => {
  const { identifier, password } = req.body as LoginBody;
  const user = await usersModel.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  });
  if (!user) {
    res
      .status(httpStatus.UNAUTHORIZED)
      .json({ message: "username or email not found" });
    return;
  }

  const checkPassword = bcrypt.compareSync(password, user.password);

  if (!checkPassword) {
    return res
      .status(httpStatus.UNAUTHORIZED)
      .json({ message: "password is not valid" });
  }

  const accessToken = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET as string
  );

  res.cookie("token", accessToken);
  res.json({ message: "You have successfully logged in" });
};

export let register = async (req: express.Request, res: express.Response) => {
  const { name, username, email, password } = req.body as RegisterBody;

  const user = await usersModel.findOne({ $or: [{ email }, { username }] });
  const banUser = await usersModel.findOne({ email });
  if (user) {
    res
      .status(httpStatus.UNAUTHORIZED)
      .json({ message: "Username or email already exists" });
    return;
  }

  if (banUser) {
    res
      .status(httpStatus.UNAUTHORIZED)
      .json({ message: "You are banned, you cannot register" });
    return;
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const users = await usersModel.find();
  const newUser = await usersModel.create({
    name,
    username,
    email,
    password: hashedPassword,
    isSuperAdmin: users.length == 0,
    isAdmin: users.length == 0,
  });
  const twoMonths = 60 * 60 * 24 * 60 * 1000;
  const accessToken = jwt.sign(
    { id: newUser._id },
    process.env.JWT_SECRET as string,
    {
      expiresIn: twoMonths,
    }
  );
  res.cookie("token", accessToken, {
    maxAge: twoMonths,
    httpOnly: true,
  });
  res
    .status(httpStatus.CREATED)
    .json({ message: "Registration was successful" });
};

export let logout = async (req: express.Request, res: express.Response) => {
  if (req.cookies?.token) {
    res.clearCookie("token");
    res.json({ message: "You have successfully logged out" });
    return;
  }
  res.status(httpStatus.NOT_FOUND).json({ message: "User token not found" });
};
