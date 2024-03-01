import { Request, Response, NextFunction } from "express";
import { userPlaylistBody } from "../interfaces/userPlaylist";
import userPlaylistModel from "../models/userPlaylist";
import httpStatus from "http-status";
import httpErrors from "http-errors";
import musicModel from "../models/music";
import pagination from "../helpers/pagination";
import path from "path";
import fs from "fs";
import { isValidObjectId } from "mongoose";
export let create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as userPlaylistBody;
    const { user } = req as any;

    const userPlaylist = await userPlaylistModel.findOne({
      title: body.title,
      createBy: user._id,
    });

    if (userPlaylist) {
      throw httpErrors.Conflict("There is already a playlist with this title");
    }

    await userPlaylistModel.create({
      ...body,
      cover: req.file && `/usersPlaylistCover/${req.file.filename}`,
      createBy: user._id,
    });
    res
      .status(httpStatus.CREATED)
      .json({ message: "Create user playlist successfully" });
  } catch (error) {
    next(error);
  }
};
export let getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as any;
    const query = userPlaylistModel
      .find({ createBy: user._id })
      .populate({
        path: "musics",
        select: "-__v",
        populate: [
          { path: "artist", select: "fullName englishName photo" },
          { path: "genre", select: "title description" },
          { path: "country", select: "title description image" },
          { path: "createBy", select: "name username profile" },
        ],
      })
      .select("-__v -createBy")
      .sort({ createdAt: "desc" })
      .lean();
    const data = await pagination(req, query, userPlaylistModel);

    if (data.error) {
      throw httpErrors(data?.error?.status || 400, data.error?.message || "");
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};
export let update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { user } = req as any;
    const body = req.body as userPlaylistBody;
    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("User playlist id is not from mongodb");
    }
    const userPlaylist = await userPlaylistModel.findOne({
      _id: id,
      createBy: user._id,
    });

    if (!userPlaylist) {
      throw httpErrors.NotFound("User playlist not found");
    }

    const existingUserPlaylist = await userPlaylistModel.findOne({
      title: body.title,
    });

    if (existingUserPlaylist && existingUserPlaylist._id.toString() !== id) {
      throw httpErrors.Conflict("User playlist with this name already exists");
    }

    if (req.file && userPlaylist.cover) {
      fs.unlinkSync(path.join(process.cwd(), "public", userPlaylist.cover));
    }

    await userPlaylistModel.findByIdAndUpdate(id, {
      ...body,
      cover: req.file && `/usersPlaylistCover/${req.file.filename}`,
    });

    res.json({ message: "Updated user playlist successfully" });
  } catch (error) {
    next(error);
  }
};
export let remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { user } = req as any;

    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("User playlist id is not from mongodb");
    }
    const userPlaylist = await userPlaylistModel.findOne({
      _id: id,
      createBy: user._id,
    });

    if (!userPlaylist) {
      throw httpErrors.NotFound("User playlist not found");
    }

    if (userPlaylist.cover) {
      fs.unlinkSync(path.join(process.cwd(), "public", userPlaylist.cover));
    }

    await userPlaylistModel.findByIdAndDelete(id);

    res.json({ message: "Deleted user playlist successfully" });
  } catch (error) {
    next(error);
  }
};
export let getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { user } = req as any;

    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("User playlist id is not from mongodb");
    }
    const userPlaylist = await userPlaylistModel
      .findOne({ _id: id, createBy: user._id })
      .populate({
        path: "musics",
        select: "-__v",
        populate: [
          { path: "artist", select: "fullName englishName photo" },
          { path: "genre", select: "title description" },
          { path: "country", select: "title description image" },
          { path: "createBy", select: "name username profile" },
        ],
      })
      .select("-__v -createBy")
      .lean();

    if (!userPlaylist) {
      throw httpErrors.NotFound("User playlist not found");
    }

    res.json(userPlaylist);
  } catch (error) {
    next(error);
  }
};
export let search = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userPlaylist } = req.query;
    const { user } = req as any;
    if (!userPlaylist) {
      throw httpErrors.BadRequest("user playlist is required");
    }

    const query = userPlaylistModel
      .find({
        title: { $regex: userPlaylist },
        createBy: user._id,
      })
      .populate({
        path: "musics",
        select: "-__v",
        populate: [
          { path: "artist", select: "fullName englishName photo" },
          { path: "genre", select: "title description" },
          { path: "createBy", select: "name username profile" },
          { path: "country", select: "title description image" },
        ],
      })
      .select("-__v -createBy")
      .lean();

    const data = await pagination(req, query, userPlaylistModel);

    if (data.error) {
      throw httpErrors(data?.error?.status || 400, data.error?.message || "");
    }
    res.json(data);
  } catch (error) {
    next(error);
  }
};
export let addMusic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { playlistId, musicId } = req.params;
    const { user } = req as any;

    if (!isValidObjectId(playlistId)) {
      throw httpErrors.BadRequest("User playlist id is not from mongodb");
    }
    const userPlaylist = await userPlaylistModel
      .findOne({ _id: playlistId, createBy: user._id })
      .lean();
    if (!userPlaylist) {
      throw httpErrors.NotFound("User playlist not found");
    }

    if (!isValidObjectId(musicId)) {
      throw httpErrors.BadRequest("Music id is not from mongodb");
    }
    const music = await musicModel.findById(musicId).lean();
    if (!music) {
      throw httpErrors.NotFound("Music not found");
    }

    const musicInToPlaylist = await userPlaylistModel
      .findOne({ musics: { $in: musicId } })
      .lean();

    if (musicInToPlaylist) {
      throw httpErrors.Conflict("This music is already in the user's playlist");
    }

    await userPlaylistModel.findByIdAndUpdate(playlistId, {
      $addToSet: { musics: musicId },
    });

    res.json({ message: "Music added to user playlist successfully" });
  } catch (error) {
    next(error);
  }
};
export let removeMusic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { playlistId, musicId } = req.params;
    const { user } = req as any;

    if (!isValidObjectId(playlistId)) {
      throw httpErrors.BadRequest("User playlist id is not from mongodb");
    }
    const userPlaylist = await userPlaylistModel
      .findOne({ _id: playlistId, createBy: user._id })
      .lean();

    if (!userPlaylist) {
      throw httpErrors.NotFound("User playlist not found");
    }

    if (!isValidObjectId(musicId)) {
      throw httpErrors.BadRequest("Music id is not from mongodb");
    }
    const music = await musicModel.findById(musicId).lean();
    if (!music) {
      throw httpErrors.NotFound("Music not found");
    }

    const musicInToPlaylist = await userPlaylistModel
      .findOne({ musics: { $in: musicId } })
      .lean();

    if (!musicInToPlaylist) {
      throw httpErrors.NotFound("This music is not in the playlist");
    }

    await userPlaylistModel.findByIdAndUpdate(playlistId, {
      $pull: { musics: musicId },
    });

    res.json({
      message:
        "The music has been successfully removed from the user's playlist",
    });
  } catch (error) {
    next(error);
  }
};
