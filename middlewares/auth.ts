import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import httpErrors from "http-errors";
import usersModel from "../models/users";
import banUserModel from "../models/banUser";
dotenv.config();
export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      throw httpErrors.Forbidden(
        "This path is protected. To access it, you must log in first"
      );
    }
    const checkToken = jwt.verify(token, process.env.JWT_SECRET as string);

    const user = await usersModel
      .findById((checkToken as any).id)
      .select("-password");

    if (!user) {
      throw httpErrors.NotFound("User not found");
    }
    
    const isBanUser = await banUserModel.findOne({ email: user.email });
    if (isBanUser) {
      throw httpErrors.Forbidden("You have been banned by admin");
    }

    (req as any).user = user;
    next();
  } catch (error) {
    next(error);
  }
};
