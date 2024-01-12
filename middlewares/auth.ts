import express from "express";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import usersModel from "../models/users";
import banUserModel from "../models/banUser";
dotenv.config();
export default async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const token = req.cookies?.token;
  if (!token) {
    res.status(httpStatus.UNAUTHORIZED).json({
      message: "This path is protected. To access it, you must log in first",
    });
    return;
  }
  const checkToken = jwt.verify(token, process.env.JWT_SECRET as string);
  if (checkToken) {
    const user = await usersModel
      .findById((checkToken as any).id)
      .select("-password");

    if (!user) {
      res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
      return;
    }
    const isBanUser = await banUserModel.findOne({ email: user.email });
    if (isBanUser) {
      res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: "You have been banned by admin" });
      return;
    }

    (req as any).user = user;
    next();
    return;
  }
  res.status(httpStatus.BAD_REQUEST).json({ message: "Token is not valid" });
};
