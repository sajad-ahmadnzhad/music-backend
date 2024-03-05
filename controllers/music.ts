import { NextFunction, Request, Response } from "express";
import musicModel from "./../models/music";
import countryModel from "../models/country";
import { MusicBody, MusicFile } from "./../interfaces/music";
import httpStatus from "http-status";
import fs from "fs";
import { isValidObjectId } from "mongoose";
import path from "path";
import httpErrors from "http-errors";
import nodeMediainfo from "node-mediainfo";
import albumModel from "../models/album";
import singerModel from "../models/singer";
import genreModel from "../models/genre";
import pagination from "../helpers/pagination";
export let create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as MusicBody;
    const files = { ...req.files } as MusicFile;
    const countFiles = Object.entries({ ...files }).length;
    const { user } = req as any;

    if (!countFiles || countFiles !== 2) {
      throw httpErrors.BadRequest("music and cover is required");
    }

    const music = await musicModel.findOne({
      title: body.title,
      artist: body.artist,
    });

    if (music) {
      throw httpErrors.Conflict("This music already exists");
    }

    if (body.album) {
      const album = await albumModel.findOne({
        _id: body.album,
        artist: body.artist,
      });

      if (!album) throw httpErrors.NotFound("No album found for this singer");
    }
    const singer = await singerModel
      .findById(body.artist)
      .populate("country", "_id");

    const result = await nodeMediainfo(files.music[0].path);
    const duration = result.media.track[0].Duration as any;
    const minutes = Math.floor(duration / 60).toString();
    const seconds = Math.floor(duration % 60).toString();

    await musicModel.create({
      ...body,
      duration: `${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`,
      cover_image: `/coverMusics/${files.cover[0].filename}`,
      download_link: `/musics/${files.music[0].filename}`,
      createBy: user._id,
      isSingle: !body.album,
      country: singer!.country._id,
    });

    res
      .status(httpStatus.CREATED)
      .json({ message: "Create new music successfully" });
  } catch (error) {
    next(error);
  }
};
export let getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = musicModel
      .find()
      .populate("artist", "photo fullName")
      .populate("country", "title description image")
      .populate("genre", "title description")
      .populate("createBy", "name username profile")
      .populate("likes", "name username profile")
      .populate("album", "title photo description")
      .sort({ createdAt: -1 })
      .select("-__v")
      .lean();

    const data = await pagination(req, query, musicModel);

    if (data.error) {
      throw httpErrors(data?.error?.status || 400, data.error?.message || "");
    }

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
      throw httpErrors.BadRequest("This music id is not from mongodb");
    }

    const music = await musicModel.findOne({ _id: id });

    if (!music) {
      throw httpErrors.NotFound("Music not found");
    }

    if (user._id !== music.createBy && !user.isSuperAdmin) {
      throw httpErrors.BadRequest(
        "Only the person who created this music can delete it"
      );
    }

    await musicModel.deleteOne({ _id: id });
    res.json({ message: "Deleted music successfully" });
  } catch (error) {
    next(error);
  }
};
export let update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const body = req.body as MusicBody;
    const { user } = req as any;
    const files = { ...req.files } as MusicFile;

    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("This music id is not from mongodb");
    }

    const music = await musicModel.findOne({ _id: id });

    if (!music) {
      throw httpErrors.NotFound("Music not found");
    }

    if (user._id !== music.createBy && !user.isSuperAdmin) {
      throw httpErrors.BadRequest(
        "Only the person who created this music can edit it"
      );
    }

    const existingMusic = await musicModel.findOne({
      title: body.title,
      artist: body.artist,
    });
    if (existingMusic && existingMusic._id.toString() !== id) {
      throw httpErrors.Conflict(
        "Music with this name and artist already exists"
      );
    }

    if (files?.cover)
      fs.unlinkSync(path.join(process.cwd(), "public", music.cover_image));

    if (files?.music)
      fs.unlinkSync(path.join(process.cwd(), "public", music.download_link));

    const cover_image =
      files?.cover && `/coverMusics/${files.cover[0].filename}`;

    const download_link = files?.music && `/musics/${files.music[0].filename}`;

    await musicModel.updateOne(
      { _id: id },
      {
        ...body,
        cover_image,
        download_link,
      }
    );

    res.json({ message: "Updated music successfully" });
  } catch (error) {
    next(error);
  }
};
export let search = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { music } = req.query;

    if (!music) {
      throw httpErrors.BadRequest("Music title is required");
    }
    const query = musicModel
      .find({ title: { $regex: (music as string)?.trim() } })
      .populate("artist", "photo fullName")
      .populate("country", "title description image")
      .populate("genre", "title description")
      .populate("createBy", "name username profile")
      .populate("likes", "name username profile")
      .populate("album", "title photo description")
      .select("-__v")
      .lean();

    const data = await pagination(req, query, musicModel);

    if (data.error) {
      throw httpErrors(data?.error?.status || 400, data.error?.message || "");
    }
    res.json(data);
  } catch (error) {
    next(error);
  }
};
export let popular = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type } = req.query;

    if (!type) {
      throw httpErrors.BadRequest("Type is required");
    }
    const types = ["likes", "views", "download"];

    if (!types.includes(type as string)) {
      throw httpErrors.BadRequest(`Only ${types.join(" ")} fields are allowed`);
    }

    const query = musicModel
      .find()
      .populate("artist", "photo fullName")
      .populate("country", "title description image")
      .populate("genre", "title description")
      .populate("createBy", "name username profile")
      .populate("likes", "name username profile")
      .populate("album", "title photo description")
      .sort({ createdAt: -1 })
      .select("-__v")
      .sort({ [type as string]: -1 })
      .lean();

    const data = await pagination(req, query, musicModel);

    if (data.error) {
      throw httpErrors(data?.error?.status || 400, data.error?.message || "");
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};
export let like = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { user } = req as any;
    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("Music id is not from mongodb");
    }

    const music = await musicModel.findById(id);

    if (!music) {
      throw httpErrors.NotFound("Music not found");
    }

    if (music.likes.includes(user._id)) {
      throw httpErrors.Conflict("You have already liked");
    }

    await musicModel.findByIdAndUpdate(id, {
      $addToSet: { likes: user._id },
      $inc: { count_likes: 1 },
    });

    res.json({ message: "Liked music successfully" });
  } catch (error: any) {
    next(error);
  }
};
export let unlike = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { user } = req as any;
    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("Music id is not from mongodb");
    }

    const music = await musicModel.findById(id);

    if (!music) {
      throw httpErrors.NotFound("Music not found");
    }

    if (!music.likes.includes(user._id)) {
      throw httpErrors.Conflict("You have not liked the music");
    }

    await musicModel.findByIdAndUpdate(id, {
      $pull: { likes: user._id },
      $inc: { count_likes: -1 },
    });

    res.json({ message: "The music was successfully unliked" });
  } catch (error: any) {
    next(error);
  }
};
export let view = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("This music id is not from mongodb");
    }

    const music = await musicModel.findOneAndUpdate(
      { _id: id },
      { $inc: { count_views: 1 } }
    );

    if (!music) {
      throw httpErrors.NotFound("Music not found");
    }

    res.json({ message: "music viewed successfully" });
  } catch (error) {
    next(error);
  }
};
export let download = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "This music id is not from mongodb" });
    return;
  }

  const music = await musicModel.findOneAndUpdate(
    { _id: id },
    { $inc: { count_downloads: 1 } }
  );

  if (!music) {
    res.status(httpStatus.NOT_FOUND).json({ message: "Music not found" });
    return;
  }

  res.json({ message: "music downloaded successfully" });
};
export let getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("This music id is not from mongodb");
    }

    const music = await musicModel
      .findById(id)
      .populate("artist", "photo fullName englishName")
      .populate("genre", "-__v")
      .populate("createBy", "name username profile")
      .populate("likes", "name username profile")
      .populate("album", "title photo description")
      .select("-__v")
      .lean();

    if (!music) {
      throw httpErrors.NotFound("Music not found");
    }

    res.json(music);
  } catch (error) {
    next(error);
  }
};
export let getByGenreAndCountry = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { countryId, genreId } = req.params;

    if (!isValidObjectId(countryId)) {
      throw httpErrors.BadRequest("This country id is not from mongodb");
    }

    const country = await countryModel.findById(countryId);

    if (!country) {
      throw httpErrors.NotFound("country not found");
    }

    const genre = await genreModel.findById(genreId);

    if (!genre) {
      throw httpErrors.NotFound("genre not found");
    }

    const query = musicModel
      .find({ country: countryId, genre: genreId })
      .populate("artist", "photo fullName")
      .populate("country", "title description image")
      .populate("genre", "title description")
      .populate("createBy", "name username profile")
      .populate("album", "title photo description")
      .populate("likes", "name username profile")
      .select("-__v")
      .lean();

    const data = await pagination(req, query, musicModel);

    if (data.error) {
      throw httpErrors(data?.error?.status || 400, data.error?.message || "");
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};
