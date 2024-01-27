import { Request, Response, NextFunction } from "express";
import { PlayListBody } from "../interfaces/playList";
import httpStatus from "http-status";
import fs from "fs";
import path from "path";
import playListModel from "../models/playList";
import { isValidObjectId } from "mongoose";
import httpErrors from "http-errors";

export let create = async (req: Request, res: Response, next: NextFunction) => {
  const cover = req.file?.filename;
  try {
    const body = req.body as PlayListBody;
    const { user } = req as any;
    if (!cover) {
      throw httpErrors.BadRequest("cover play list is required");
    }

    const playList = await playListModel.findOne({ title: body.title });

    if (playList) {
      throw httpErrors.BadRequest("This play list already exists");
    }

    await playListModel.create({
      ...body,
      createBy: user._id,
      cover_image: `/playListCovers/${cover}`,
    });

    res
      .status(httpStatus.CREATED)
      .json({ message: "Create play list successfully" });
  } catch (error: any) {
    next(error);
  }
};
export let getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const playLists = await playListModel
      .find({})
      .populate("createBy", "name username profile")
      .select("-__v")
      .lean();
    res.json(playLists);
  } catch (error: any) {
    next(error);
  }
};
export let update = async (req: Request, res: Response, next: NextFunction) => {
  const cover = req.file?.filename;
  try {
    const { id } = req.params;
    const body = req.body as PlayListBody;
    const { user } = req as any;

    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("Play list id is not from mongodb");
    }

    const playList = await playListModel.findById(id);

    if (!playList) {
      throw httpErrors.NotFound("Play list not found");
    }

    if (user._id !== playList.createBy && !user.isSuperAdmin) {
      throw httpErrors.BadRequest(
        "This paly list can only be modified by the person who created it"
      );
    }

    if (cover) {
      fs.unlinkSync(path.join(process.cwd(), "public", playList.cover_image));
    }

    await playListModel.findByIdAndUpdate(id, {
      ...body,
      cover_image: cover && `/playListCovers/${cover}`,
    });

    res.json({ message: "Updated play list successfully" });
  } catch (error: any) {
    next(error);
  }
};
export let remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { user } = req as any;
    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("Play list id is not from mongodb");
    }

    const playList = await playListModel.findById(id);

    if (!playList) {
      throw httpErrors.NotFound("Play list not found");
    }

    if (user._id !== playList.createBy && !user.isSuperAdmin) {
      throw httpErrors.BadRequest(
        "This paly list can only be remove by the person who created it"
      );
    }

    if (playList.cover_image) {
      fs.unlinkSync(path.join(process.cwd(), "public", playList.cover_image));
    }
    await playListModel.findByIdAndDelete(id);
    res.json({ message: "Deleted play list successfully" });
  } catch (error: any) {
    next(error);
  }
};
export let like = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("paly list id is not from mongodb");
    }

    const playList = await playListModel.findByIdAndUpdate(id, {
      $inc: { count_likes: 1 },
    });

    if (!playList) {
      throw httpErrors.NotFound("Play list not found");
    }

    res.json({ message: "Liked play list successfully" });
  } catch (error: any) {
    next(error);
  }
};

