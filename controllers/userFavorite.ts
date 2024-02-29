import { Request, Response, NextFunction } from "express";
import { UserFavoriteBody } from "../interfaces/userFavorite";
import userFavoriteModel from "../models/userFavorite";
import albumModel from "../models/album";
import musicModel from "../models/music";
import httpStatus from "http-status";
import httpErrors from "http-errors";
import { isValidObjectId } from "mongoose";
import pagination from "../helpers/pagination";
export let create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, target_id } = req.body as UserFavoriteBody;
    const { user } = req as any;

    const album = await albumModel.findById(target_id);
    const music = await musicModel.findById(target_id);

    if (type === "music" && !music) {
      throw httpErrors.NotFound("Music not found");
    }

    if (type === "album" && !album) {
      throw httpErrors.NotFound("Album not found");
    }

    const userFavorite = await userFavoriteModel.findOne({
      user: user._id,
      target_id,
    });

    if (userFavorite) {
      throw httpErrors.Conflict(
        "This album or music is already in the favorite list"
      );
    }

    await userFavoriteModel.create({ type, target_id, user: user._id });

    res
      .status(httpStatus.CREATED)
      .json({ message: "Create user favorite successfully" });
  } catch (error) {
    next(error);
  }
};
export let getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as any;
    const query = userFavoriteModel
      .find({ user: user._id })
      .populate("target_id", "title photo cover_image download_link")
      .select("-user -__v")
      .lean();

    const data = await pagination(req, query, userFavoriteModel);

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
      throw httpErrors.BadRequest("This favorite id is not from mongodb");
    }

    const favoriteList = await userFavoriteModel.findOneAndDelete({
      user: user._id,
      _id: id,
    });

    if (!favoriteList) {
      throw httpErrors.NotFound("Favorite not found");
    }

    res.json({ message: "Deleted favorite successfully" });
  } catch (error) {
    next(error);
  }
};
export let getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as any;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("This favorite id is not from mongodb");
    }

    const favorite = await userFavoriteModel
      .findOne({
        user: user._id,
        _id: id,
      })
      .populate("target_id", "title photo cover_image download_link")
      .select("-user -__v")
      .lean();

    if (!favorite) {
      throw httpErrors.NotFound("Favorite not found");
    }

    res.json(favorite);
  } catch (error) {
    next(error);
  }
};
