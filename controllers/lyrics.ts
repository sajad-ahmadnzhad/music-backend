import { NextFunction, Request, Response } from "express";
import lyricsModel from "../models/lyrics";
import { isValidObjectId } from "mongoose";
import httpErrors from "http-errors";
export let create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;
    const { user } = req as any;

    const lyrics = await lyricsModel.findOne({
      creator: user._id,
      text: body.text,
    });

    if (lyrics) {
      throw httpErrors.Conflict(
        "You have already registered the lyrics for this music"
      );
    }

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
export let remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { user } = req as any;
    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("This lyrics id is not from mongodb");
    }

    const existingLyrics = await lyricsModel.findOne({
      _id: id,
      creator: user._id,
    });

    if (!existingLyrics) {
      throw httpErrors.NotFound("Lyrics not found");
    }

    await existingLyrics.deleteOne();

    res.json({ message: "Deleted lyrics successfully" });
  } catch (error) {
    next(error);
  }
};
export let update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const { user } = req as any;

    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("This lyrics id is not from mongodb");
    }

    const existingLyrics = await lyricsModel.findOne({
      _id: id,
      creator: user._id,
    });

    if (!existingLyrics) {
      throw httpErrors.NotFound("Lyrics not found");
    }

    await existingLyrics.updateOne(body);

    res.json({ message: "Updated lyrics successfully" });
  } catch (error) {
    next(error);
  }
};