import { Request, Response, NextFunction } from "express";
import removeFile from "../helpers/removeFile";
export default (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error) {
    removeFile(req);
    const statusCode = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error !!";
    res.status(statusCode).json({ message });
  }
};
