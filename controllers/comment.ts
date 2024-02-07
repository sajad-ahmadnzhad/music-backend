import { Request, Response, NextFunction } from "express";
import { CommentsBody } from "../interfaces/comment";
import commentModel from "../models/comment";
import httpStatus from "http-status";
import musicModel from "../models/music";
import { isValidObjectId } from "mongoose";
import httpErrors from "http-errors";
export let create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { musicId } = req.params;
    const body = req.body as CommentsBody;
    const { user } = req as any;
    if (!isValidObjectId(musicId)) {
      throw httpErrors.BadRequest("music id is not from mongodb");
    }

    const music = await musicModel.findById(musicId).lean();

    if (!music) {
      throw httpErrors.NotFound("Music not found");
    }

    await commentModel.create({ ...body, username: user.username, musicId });

    res
      .status(httpStatus.CREATED)
      .json({ message: "Create comment successfully" });
  } catch (error) {
    next(error);
  }
};
export let getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { musicId } = req.params;
    if (!isValidObjectId(musicId)) {
      throw httpErrors.BadRequest("music id is not from mongodb");
    }

    const music = await musicModel.findById(musicId).lean();

    if (!music) {
      throw httpErrors.NotFound("Music not found");
    }

    const comments = await commentModel
      .find({ musicId, isAccept: true })
      .lean()
      .select("-__v")
      .sort({ createdAt: "desc" });

    res.json(comments);
  } catch (error) {
    next(error);
  }
};
