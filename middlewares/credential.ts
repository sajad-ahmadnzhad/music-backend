import { NextFunction, Request, Response } from "express";
const allowedOrigins = JSON.parse(process.env.ALLOWED_ORIGINS as string) || [];
export default (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin || "";
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Credentials", "true");
  }
  next();
};
