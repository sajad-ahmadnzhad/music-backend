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
