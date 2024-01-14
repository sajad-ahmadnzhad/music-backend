import express from "express";
import musicModel from "./../models/music";
import { MusicBody } from "./../interfaces/music";
import httpStatus from "http-status";
import path from "path";
export let create = async (req: express.Request, res: express.Response) => {
  const { title, artist, genre, duration, release_year, description } =
    req.body as MusicBody;

  if (!req.file) {
    res.status(httpStatus.BAD_REQUEST).json({ message: "music is required" });
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

export let getAll = async (req: express.Request, res: express.Response) => {
  let pathMusic = path.join(__dirname, "../", "public", "musics");

  const allMusic = await musicModel.find().select("-__v");

  allMusic.forEach((music) => {
    pathMusic += `\\${music.cover_image}`;
    music.cover_image = pathMusic;
  });

  res.json(allMusic);
};
