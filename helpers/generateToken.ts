import { Types } from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();
export default (userId: Types.ObjectId, expiresIn: number | string) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
    expiresIn,
  });
};
