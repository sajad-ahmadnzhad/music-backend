import express from "express";
import usersModel from "../models/users";
import httpStatus from "http-status";
export default async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { isSuperAdmin } = (req as any).user;
  if (!isSuperAdmin) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({
        message: "This path is only active for the owner or super admin",
      });
    return;
  }
  next();
};
