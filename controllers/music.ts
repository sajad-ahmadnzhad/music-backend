import express from "express";
import musicModel from "./../models/music";
import { MusicBody, MusicFile } from "./../interfaces/music";
import httpStatus from "http-status";
import path from "path";
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

  if (!files?.music?.length) {
    if (files?.cover?.length) {
      fs.unlinkSync(files?.cover[0].path);
    }
    res.status(httpStatus.BAD_REQUEST).json({ message: "Music is required" });
    return;
  }

  if (!files?.cover?.length) {
    if (files?.music?.length) {
      fs.unlinkSync(files?.music[0].path);
    }
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Cover music is required" });
    return;
  }

  await musicModel.create({
    title,
    artist,
    genre,
    duration,
    release_year,
    description,
    cover_image: files.cover[0].filename,
    music: files.music[0].filename,
  });
  res
    .status(httpStatus.CREATED)
    .json({ message: "Create new music successfully" });
};

export let getAll = async (req: express.Request, res: express.Response) => {
  let pathCover = path.join(__dirname, "../", "public", "coverMusics");
  let pathMusic = path.join(__dirname , '../' , 'public' , 'musics')
  const allMusics = await musicModel.find().select("-__v");

  allMusics.forEach((music) => {
    pathCover += `\\${music.cover_image}`;
    music.cover_image = pathCover;
    pathMusic += `\\${music.music}`;
    music.music = pathMusic;
  });

  res.json(allMusics);
};
