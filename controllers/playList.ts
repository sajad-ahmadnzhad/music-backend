import express from "express";
import { PlayListBody } from "../interfaces/playList";
import httpStatus from "http-status";
import fs from "fs";
import path from "path";
import playListModel from "../models/playList";
import { isValidObjectId } from "mongoose";

export let create = async (req: express.Request, res: express.Response) => {
  const cover = req.file?.filename;
  try {
    const body = req.body as PlayListBody;
    const { user } = req as any;
    if (!cover) {
      throw new Error("cover play list is required");
    }

    const playList = await playListModel.findOne({ title: body.title });

    if (playList) {
      throw new Error("This play list already exists");
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
    cover &&
      fs.unlinkSync(
        path.join(process.cwd(), "public", "playListCovers", cover)
      );
    res
      .status(error.status || httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message || "Internal Server Error !!" });
  }
};
export let getAll = async (req: express.Request, res: express.Response) => {
  try {
    const playLists = await playListModel
      .find({})
      .populate("createBy", "name username profile")
      .select("-__v")
      .lean();
    res.json(playLists);
  } catch (error: any) {
    const statusCode = error.status || httpStatus.INTERNAL_SERVER_ERROR;
    const errorMessage = error.message || "Internal Server Error !!";
    res.status(statusCode).json({ errorMessage });
  }
};
export let update = async (req: express.Request, res: express.Response) => {
  const cover = req.file?.filename;
  try {
    const { id } = req.params;
    const body = req.body;
    const { user } = req as any;

    if (!isValidObjectId(id)) {
      throw new Error("Play list id is not from mongodb");
    }

    const playList = await playListModel.findById(id);

    if (!playList) {
      throw new Error("Play list not found");
    }

    if (user._id !== playList.createBy && !user.isSuperAdmin) {
      throw new Error(
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
    cover &&
      fs.unlinkSync(
        path.join(process.cwd(), "public", "playListCovers", cover)
      );
    const statusCode = error.status || httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || "Internal Server Error !!";
    res.status(statusCode).json({ message });
  }
};

