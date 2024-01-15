import express from "express";
import usersModel from "./../models/users";
import { RegisterBody, LoginBody } from "./../interfaces/auth";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import httpStatus from "http-status";
import banUserModel from "../models/banUser";
import fs from "fs";
import path from "path";
dotenv.config();
export let login = async (req: express.Request, res: express.Response) => {
  let { identifier, password } = req.body as LoginBody;
  password = password.trim();
  identifier = identifier.trim();
  const user = await usersModel.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  });
  if (!user) {
    res
      .status(httpStatus.UNAUTHORIZED)
      .json({ message: "username or email not found" });
    return;
  }

  const banUser = await banUserModel.findOne({ email: user.email });
  if (banUser) {
    res
      .status(httpStatus.UNAUTHORIZED)
      .json({ message: "You are banned, you cannot login" });
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
  let { name, username, email, password } = req.body as RegisterBody;
  name = name.trim();
  username = username.trim();
  email = email.trim();
  password = password.trim();
  const user = await usersModel.findOne({ $or: [{ email }, { username }] });
  if (user) {
    if (req.file) {
      const { filename } = req.file;
      fs.unlinkSync(
        path.join(__dirname, "../", "public", "usersProfile", filename)
      );
    }

    res
      .status(httpStatus.UNAUTHORIZED)
      .json({ message: "Username or email already exists" });
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
    profile: req.file
      ? `/usersProfile/${req.file.filename}`
      : "/usersProfile/customProfile.png",
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
};
