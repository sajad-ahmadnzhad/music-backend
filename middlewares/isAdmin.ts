import express from "express";
import httpErrors from "http-errors";

export default async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { isAdmin } = (req as any).user;
    if (!isAdmin) {
      throw httpErrors.Forbidden("This path is only for admins");
    }
    next();
  } catch (error) {
    next(error);
  }
};
