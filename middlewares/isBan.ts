import { NextFunction, Request, Response } from "express";
import banUserModel from "../models/banUser";
import httpErrors from "http-errors";
export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as any;

    const isBanUser = await banUserModel.findOne({ email: user.email });

    if (!isBanUser) return next();

    throw httpErrors.Forbidden("You are banned and cannot access this path");
  } catch (error) {
    next(error);
  }
};
