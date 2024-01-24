import express from "express";
import httpStatus from "http-status";
import albumModel from "../models/album";
import { AlbumBody } from "../interfaces/album";
import fs from "fs";
import path from "path";

export let create = async (req: express.Request, res: express.Response) => {
  const { title, description, artist } = req.body as AlbumBody;
  const { user } = req as any;
  if (!req.file) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "album photo is required" });
    return;
  }

  const album = await albumModel.findOne({ artist, title });

  if (album) {
    fs.unlinkSync(
      path.join(process.cwd(), "public", "albumPhotos", req.file.filename)
    );
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "This album already exists" });
    return;
  }

  albumModel.create({
    title,
    description,
    artist,
    photo: `/albumPhotos/${req.file.filename}`,
    createBy: user._id,
  });

  res
    .status(httpStatus.CREATED)
    .json({ message: "Create new album successfully" });
};

export let getAll = async (req: express.Request, res: express.Response) => {
  const albums = await albumModel
    .find()
    .populate("artist", "fullName englishName photo")
    .populate("musics", "title duration download_link cover genre")
    .populate("createBy", "name username profile")
    .select("-__v")
    .lean();

  res.json(albums);
};
