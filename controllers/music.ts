import express from "express";
import musicModel from "./../models/music";
import { MusicBody, MusicFile } from "./../interfaces/music";
import singerModel from "../models/singer";
import categoryModel from "../models/category";
import albumModel from "../models/album";
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

  const foundArtist = await singerModel.findById(artist);

  if (!foundArtist) {
    for (let key in files) {
      fs.unlinkSync((files as any)[key][0].path);
    }
    res.status(httpStatus.NOT_FOUND).json({ message: "Artist not found" });
    return;
  }

  const foundGenre = await categoryModel.findById(genre);

  if (!foundGenre) {
    for (let key in files) {
      fs.unlinkSync((files as any)[key][0].path);
    }
    res.status(httpStatus.NOT_FOUND).json({ message: "Genre not found" });
    return;
  }

  if (album) {
    const foundAlbum = await albumModel.findById(album);

    if (!foundAlbum) {
      for (let key in files) {
        fs.unlinkSync((files as any)[key][0].path);
      }
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
    res
      .status(httpStatus.BAD_REQUEST)
      .json({
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
    res
      .status(httpStatus.BAD_REQUEST)
      .json({
        message: "Only the person who created this music can edit it",
      });
    return;
  }

  const singer = await singerModel.findOne({ _id: artist });

  if (!singer) {
    if (files) {
      for (let key in files) {
        fs.unlinkSync((files as any)[key][0].path);
      }
    }
    res.status(httpStatus.NOT_FOUND).json({ message: "Singer not found" });
    return;
  }

  if (album) {
    const foundAlbum = await albumModel.findOne({ _id: album });
    if (!foundAlbum) {
      if (files) {
        for (let key in files) {
          fs.unlinkSync((files as any)[key][0].path);
        }
      }
      res.status(httpStatus.NOT_FOUND).json({ message: "Album not found" });
      return;
    }
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
