import express from "express";
import musicModel from "./../models/music";
import { MusicBody } from "./../interfaces/music";
import httpStatus from "http-status";
export let create = async (req: express.Request, res: express.Response) => {
  const { title, artist, genre, duration, release_year, description } =
    req.body as MusicBody;

  if (!req.file) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "music is required" });
    return;
  }

  await musicModel.create({
    title,
    artist,
    genre,
    duration,
    release_year,
    description,
    cover_image: req.file.filename,
  });
  res
    .status(httpStatus.CREATED)
    .json({ message: "Create new music successfully" });
};
