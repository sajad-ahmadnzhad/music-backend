import express from "express";
import { UserFavoriteBody } from "../interfaces/userFavorite";
import userFavoriteModel from "../models/userFavorite";
import albumModel from "../models/album";
import musicModel from "../models/music";
import httpStatus from "http-status";
export let create = async (req: express.Request, res: express.Response) => {
  const { type, target_id } = req.body as UserFavoriteBody;
  const { user } = req as any;

  const album = await albumModel.findById(target_id);
  const music = await musicModel.findById(target_id);

  if (type === "music" && !music) {
    res.status(httpStatus.NOT_FOUND).json({ message: "Music not found" });
    return;
  }

  if (type === "albums" && !album) {
    res.status(httpStatus.NOT_FOUND).json({ message: "Album not found" });
    return;
  }

  const userFavorite = await userFavoriteModel.findOne({
    user: user._id,
    target_id,
  });

  if (userFavorite) {
    res.status(httpStatus.BAD_REQUEST).json({
      message: "This album or music is already in the favorite list",
    });
    return;
  }

  await userFavoriteModel.create({ type, target_id, user: user._id });

  res
    .status(httpStatus.CREATED)
    .json({ message: "Create user favorite successfully" });
};
export let getAll = async (req: express.Request, res: express.Response) => {
  const { user } = req as any;
  const favoriteList = await userFavoriteModel
    .find({ user: user._id })
    .populate("target_id", "title photo cover_image download_link")
    .select("-user -__v")
    .lean();
  res.json(favoriteList);
};