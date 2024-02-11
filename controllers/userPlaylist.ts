import { Request, Response, NextFunction } from "express";
import { userPlaylistBody } from "../interfaces/userPlaylist";
import userPlaylistModel from "../models/userPlaylist";
import httpStatus from "http-status";
import httpErrors from "http-errors";
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
    const userPlaylists = await userPlaylistModel
      .find({ createBy: user._id })
      .populate("musics", "-__v")
      .select("-__v -createBy")
      .lean();

    res.json(userPlaylists);
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
