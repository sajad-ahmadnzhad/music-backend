import express from "express";
import usersModel from "../models/users";
import httpStatus from "http-status";
export default async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { isAdmin } = (req as any).user;
  if (!isAdmin) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "This path is only for admins" });
    return;
  }
  next();
};
