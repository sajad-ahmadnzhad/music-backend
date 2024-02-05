import express from "express";
import httpErrors from "http-errors";

export default async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { isSuperAdmin } = (req as any).user;
    if (!isSuperAdmin) {
      throw httpErrors.Forbidden(
        "This path is only active for the owner or super admin"
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};
