import { Request, Response, NextFunction } from "express";
import { CommentsBody } from "../interfaces/comment";
import commentModel from "../models/comment";
import httpStatus from "http-status";
export let create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as CommentsBody;
    const { user } = req as any;
    const { musicId } = req.params;

    await commentModel.create({ ...body, creator: user._id, music: musicId });

    res
      .status(httpStatus.CREATED)
      .json({ message: "Create comment successfully" });
  } catch (error) {
    next(error);
  }
};
export let getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
