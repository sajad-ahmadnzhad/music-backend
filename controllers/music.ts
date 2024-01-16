import express from "express";
import musicModel from "./../models/music";
import { MusicBody, MusicFile } from "./../interfaces/music";
import httpStatus from "http-status";
import fs from "fs";

export let create = async (req: express.Request, res: express.Response) => {
  const { title, artist, genre, duration, release_year, description } =
    req.body as MusicBody;
  const files = { ...req.files } as MusicFile;
  const countFiles = Object.entries({ ...files }).length;

  if (!countFiles) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "music and cover is required" });
    return;
  }

  if (countFiles !== 2) {
    for (let key in files) {
      const file = (files as any)[key][0];
      fs.unlinkSync(file.path);
      const field = file.fieldname == "music" ? "Cover" : "Music";
      res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: `${field} is required` });
    }
    return;
  }

  await musicModel.create({
    title,
    artist,
    genre,
    duration,
    release_year,
    description,
    cover_image: `/coverMusics/${files.cover[0].filename}`,
    music: `/musics/${files.music[0].filename}`,
    createBy: (req as any).user._id,
  });
  res
    .status(httpStatus.CREATED)
    .json({ message: "Create new music successfully" });
};

export let getAll = async (req: express.Request, res: express.Response) => {
  const allMusics = await musicModel.find().select("-__v");
  res.json(allMusics);
};
