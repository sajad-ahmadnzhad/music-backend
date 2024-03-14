import { NextFunction, Request, Response } from "express";
import lyricsModel from "../models/lyrics";
export let create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const { user } = req as any;

    await lyricsModel.create({
      ...body,
      creator: user._id,
    });

    res.json({ message: "Lyrics added. Waiting for admin confirmation" });
  } catch (error) {
    next(error);
  }
};
export let getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as any;

    const lyrics = await lyricsModel
      .find({ creator: user._id })
      .populate("musicId", "title description createBy cover_image")
      .populate("creator", "name username profile")
      .select("-__v")
      .lean();

    res.json(lyrics);
  } catch (error) {
    next(error);
  }
};
