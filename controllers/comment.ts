import { Request, Response, NextFunction } from "express";
import { CommentsBody } from "../interfaces/comment";
import commentModel from "../models/comment";
import httpStatus from "http-status";
import { isValidObjectId } from "mongoose";
import httpErrors from "http-errors";
import musicModel from '../models/music'
export let create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as CommentsBody;
    const { user } = req as any;
    const { musicId } = req.params;

    if (!isValidObjectId(musicId)) {
      throw httpErrors.BadRequest("This music id is not from mongodb");
    }

    const music = await musicModel.findById(musicId).lean();

    if (!music) {
      throw httpErrors.NotFound("Music not found");
    }

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
