import express from "express";
import musicModel from "./../models/music";
import { MusicBody, MusicFile } from "./../interfaces/music";
import singerModel from "../models/singer";
import categoryModel from "../models/category";
import albumModel from "../models/album";
import httpStatus from "http-status";
import fs from "fs";
import { isValidObjectId } from "mongoose";

export let create = async (req: express.Request, res: express.Response) => {
  const {
    title,
    artist,
    genre,
    duration,
    release_year,
    description,
    lyrics,
    album,
  } = req.body as MusicBody;
  const files = { ...req.files } as MusicFile;
  const countFiles = Object.entries({ ...files }).length;
  const { user } = req as any;
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

  const music = await musicModel.findOne({ title, artist });

  if (music) {
    for (let key in files) {
      fs.unlinkSync((files as any)[key][0].path);
    }

    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "This music already exists" });
    return;
  }

  if (!isValidObjectId(artist)) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "This artist id is not from mongodb" });
    return;
  }

  const foundArtist = await singerModel.findById(artist);

  if (!foundArtist) {
    res.status(httpStatus.NOT_FOUND).json({ message: "Artist not found" });
    return;
  }

  if (!isValidObjectId(genre)) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "This genre id is not from mongodb" });
    return;
  }

  const foundGenre = await categoryModel.findById(genre);

  if (!foundGenre) {
    res.status(httpStatus.NOT_FOUND).json({ message: "Genre not found" });
    return;
  }

  if (album && !isValidObjectId(album)) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "This album id is not from mongodb" });
    return;
  }

  if (album) {
    const foundAlbum = await albumModel.findById(album);

    if (!foundAlbum) {
      res.status(httpStatus.NOT_FOUND).json({ message: "Album not found" });
      return;
    }
  }

  await musicModel.create({
    title,
    artist,
    genre,
    duration,
    release_year,
    description,
    lyrics,
    album,
    cover_image: `/coverMusics/${files.cover[0].filename}`,
    download_link: `/musics/${files.music[0].filename}`,
    createBy: user._id,
  });

  res
    .status(httpStatus.CREATED)
    .json({ message: "Create new music successfully" });
};

export let getAll = async (req: express.Request, res: express.Response) => {
  const allMusics = await musicModel
    .find()
    .populate("artist", "photo fullName englishName")
    .populate("genre", "-__v")
    .populate("createBy", "name username profile")
    .populate("album", "-__v")
    .select("-__v");
  res.json(allMusics);
};
