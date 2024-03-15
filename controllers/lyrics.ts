import { NextFunction, Request, Response } from "express";
import lyricsModel from "../models/lyrics";
import musicModel from "../models/music";
import notificationModel from "../models/notification";
import pagination from "../helpers/pagination";
import {LyricsBody} from '../interfaces/lyrics'
import { isValidObjectId } from "mongoose";
import httpErrors from "http-errors";
export let create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as LyricsBody;
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

    const query = lyricsModel
      .find({ creator: user._id })
      .sort({ createdAt: -1 })
      .lean();

    const data = await pagination(req, query, lyricsModel);

    if (data.error) throw data.error;

    res.json(data);
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
    const body = req.body as LyricsBody;
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
export let accept = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { user } = req as any;
    const { message } = req.body;

    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("This lyrics id is not from mongodb");
    }

    if (!message) {
      throw httpErrors.BadRequest("Message is required");
    }

    const existingLyrics = await lyricsModel.findById(id);

    if (!existingLyrics) throw httpErrors.NotFound("Lyrics not found");

    if (existingLyrics.isAccept) {
      throw httpErrors.Conflict("This lyrics already accepted");
    }

    const music = await musicModel.findById(existingLyrics.musicId);

    if (String(music?.createBy) !== String(user._id) && !user.isSuperAdmin) {
      throw httpErrors.BadRequest(
        "Only the admin who created the music can accept it"
      );
    }

    await musicModel.findByIdAndUpdate(music?._id, {
      lyrics: existingLyrics.text,
    });

    await existingLyrics.updateOne({
      isAccept: true,
      isReject: false,
    });

    await notificationModel.create({
      type: "music",
      title: "Accepted lyrics",
      message,
      creator: user._id,
      receiver: existingLyrics.creator,
    });

    res.json({ message: "Accepted lyrics successfully" });
  } catch (error) {
    next(error);
  }
};
export let reject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as any;
    const { id } = req.params;
    const { message } = req.body;

    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("This lyrics id is not from mongodb");
    }

    if (!message) {
      throw httpErrors.BadRequest("Message is required");
    }

    const existingLyrics = await lyricsModel.findById(id);

    if (!existingLyrics) throw httpErrors.NotFound("Lyrics not found");

    if (existingLyrics.isReject) {
      throw httpErrors.Conflict("This lyrics already rejected");
    }

    const music = await musicModel.findById(existingLyrics.musicId);

    if (String(music?.createBy) !== String(user._id) && !user.isSuperAdmin) {
      throw httpErrors.BadRequest(
        "Only the admin who created the music can reject it"
      );
    }

    await existingLyrics.updateOne({
      isReject: true,
      isAccept: false,
    });

    await musicModel.findByIdAndUpdate(existingLyrics.musicId, {
      $unset: { lyrics: 1 },
    });

    await notificationModel.create({
      type: "music",
      title: "Rejected lyrics",
      message,
      creator: user._id,
      receiver: existingLyrics.creator,
    });

    res.json({ message: "Rejected lyrics successfully" });
  } catch (error) {
    next(error);
  }
};
export let unaccepted = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = req as any;
    const musicIds = (
      await musicModel.find({ createBy: user._id }).select("_id")
    ).map((item) => item._id);

    const query = lyricsModel
      .find({
        isAccept: false,
        musicId: { $in: musicIds },
      })
      .lean();

    const data = await pagination(req, query, lyricsModel);

    if (data.error) throw data.error;

    res.json(data);
  } catch (error) {
    next(error);
  }
};
