import express from "express";
import musicModel from "./../models/music";
import { MusicBody, MusicFile } from "./../interfaces/music";
import httpStatus from "http-status";
import fs from "fs";
import { isValidObjectId } from "mongoose";
import path from "path";

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
export let remove = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const { user } = req as any;
  if (!isValidObjectId(id)) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "This music id is not from mongodb" });
    return;
  }

  const music = await musicModel.findOne({ _id: id });

  if (!music) {
    res.status(httpStatus.NOT_FOUND).json({ message: "Music not found" });
    return;
  }

  if (user._id.toString() !== music.createBy.toString() && !user.isSuperAdmin) {
    res.status(httpStatus.BAD_REQUEST).json({
      message: "Only the person who created this music can delete it",
    });
    return;
  }

  fs.unlinkSync(path.join(__dirname, "../", "public", music.cover_image));
  fs.unlinkSync(path.join(__dirname, "../", "public", music.download_link));

  await musicModel.deleteOne({ _id: id });

  res.json({ message: "Deleted music successfully" });
};
export let update = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
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
  const { user } = req as any;
  const files = { ...req.files } as MusicFile;

  const music = await musicModel.findOne({ _id: id });

  if (!music) {
    if (files) {
      for (let key in files) {
        fs.unlinkSync((files as any)[key][0].path);
      }
    }
    res.status(httpStatus.NOT_FOUND).json({ message: "Music not found" });
    return;
  }

  if (user._id.toString() !== music.createBy.toString() && !user.isSuperAdmin) {
    if (files) {
      for (let key in files) {
        fs.unlinkSync((files as any)[key][0].path);
      }
    }
    res.status(httpStatus.BAD_REQUEST).json({
      message: "Only the person who created this music can edit it",
    });
    return;
  }

  if (files) {
    if (files.cover) {
      fs.unlinkSync(path.join(__dirname, "../", "public", music.cover_image));
    }

    if (files.music) {
      fs.unlinkSync(path.join(__dirname, "../", "public", music.download_link));
    }
  }

  const cover_image = files?.cover
    ? `/coverMusics/${files.cover[0].filename}`
    : music.cover_image;

  const download_link = files?.music
    ? `/musics/${files.music[0].filename}`
    : music.download_link;

  await musicModel.updateOne(
    { _id: id },
    {
      title,
      artist,
      genre,
      duration,
      release_year,
      description,
      lyrics,
      album,
      cover_image,
      download_link,
    }
  );

  res.json({ message: "Updated music successfully" });
};
export let search = async (req: express.Request, res: express.Response) => {
  const { music } = req.query;

  if (!music) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Please enter a music name" });
    return;
  }

  const foundMusic = await musicModel
    .find({ title: { $regex: music } })
    .populate("artist", "photo fullName englishName")
    .populate("genre", "-__v")
    .populate("createBy", "name username profile")
    .populate("album", "-__v")
    .select("-__v");

  if (!foundMusic.length) {
    res.status(httpStatus.NOT_FOUND).json({ message: "Music not found" });
    return;
  }

  res.json(foundMusic);
};
export let popular = async (req: express.Request, res: express.Response) => {
  const popularMusics = await musicModel
    .find()
    .populate("artist", "photo fullName englishName")
    .populate("genre", "-__v")
    .populate("createBy", "name username profile")
    .populate("album", "-__v")
    .select("-__v");

  popularMusics.sort((a, b) => b.count_views - a.count_views);

  res.json(popularMusics);
};
export let like = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res
      .status(httpStatus.NOT_MODIFIED)
      .json({ message: "This music id is not from mongodb" });
    return;
  }

  const music = await musicModel.findOneAndUpdate(
    { _id: id },
    { $inc: { count_likes: 1 } }
  );

  if (!music) {
    res.status(httpStatus.NOT_FOUND).json({ message: "Music not found" });
    return;
  }

  res.json({ message: "music liked successfully" });
};
export let view = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res
      .status(httpStatus.NOT_MODIFIED)
      .json({ message: "This music id is not from mongodb" });
    return;
  }

  const music = await musicModel.findOneAndUpdate(
    { _id: id },
    { $inc: { count_views: 1 } }
  );

  if (!music) {
    res.status(httpStatus.NOT_FOUND).json({ message: "Music not found" });
    return;
  }

  res.json({ message: "music viewed successfully" });  
};
export let download = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res
      .status(httpStatus.NOT_MODIFIED)
      .json({ message: "This music id is not from mongodb" });
    return;
  }

  const music = await musicModel.findOneAndUpdate(
    { _id: id },
    { $inc: { count_views: 1 } }
  );

  if (!music) {
    res.status(httpStatus.NOT_FOUND).json({ message: "Music not found" });
    return;
  }

  res.json({ message: "music viewed successfully" });    
};
export let getOne = async (req: express.Request, res: express.Response) => {};
