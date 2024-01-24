import express from "express";
import singerModel from "../models/singer";
import { SingerBody } from "../interfaces/singer";
import { isValidObjectId } from "mongoose";
import categoryModel from "../models/category";
import musicModel from "../models/music";
import albumModel from "../models/album";
import archiveModel from "../models/archive";
import commentModel from "../models/comment";
import criticismModel from "../models/criticism";
import palyListModel from "../models/playList";
import userFavoriteModel from "../models/userFavorite";
import upcomingModel from "../models/upcoming";
import httpStatus from "http-status";
import fs from "fs";
import path from "path";
export let getAll = async (req: express.Request, res: express.Response) => {
  const singers = await singerModel
    .find()
    .populate("musicStyle", "-__v")
    .populate("album", "title")
    .populate("createBy", "name username profile")
    .select("-__v")
    .lean();
  res.json(singers);
};
export let create = async (req: express.Request, res: express.Response) => {
  const { fullName, nickname, englishName, musicStyle, nationality } =
    req.body as SingerBody;

  if (!req.file) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "photo singer is required" });
    return;
  }
  if (!isValidObjectId(musicStyle)) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "This music style is not from mongodb" });
    return;
  }
  const category = await categoryModel.findOne({ _id: musicStyle });
  if (!category) {
    res.status(httpStatus.NOT_FOUND).json({ message: "Category not found" });
    return;
  }

  const singer = await singerModel.findOne({ fullName });

  if (singer) {
    fs.unlinkSync(req.file.path);
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "This singer already exists" });
    return;
  }

  await singerModel.create({
    fullName,
    nickname,
    englishName,
    musicStyle,
    nationality,
    photo: `/photoSingers/${req.file.filename}`,
    createBy: (req as any).user._id,
  });

  res
    .status(httpStatus.CREATED)
    .json({ message: "Create new singer successfully" });
};
export let search = async (req: express.Request, res: express.Response) => {
  const { artist } = req.query;

  if (!artist) {
    res.status(httpStatus.BAD_REQUEST).json({
      message: "Please enter a artist name or nickname or english name",
    });
    return;
  }

  const foundArtists = await singerModel
    .findOne({
      $or: [
        { fullName: artist },
        { nickname: artist },
        { englishName: artist },
      ],
    })
    .populate("musicStyle", "-__v")
    .populate("album", "title")
    .populate("createBy", "name username profile")
    .lean();
  if (!foundArtists) {
    res.status(httpStatus.NOT_FOUND).json({ message: "Artist not found" });
    return;
  }

  res.json(foundArtists);
};
export let update = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const { user } = req as any;
  const { englishName, fullName, nationality, nickname } =
    req.body as SingerBody;
  const photo = req.file?.filename;

  if (!isValidObjectId(id)) {
    if (photo) {
      fs.unlinkSync(path.join(process.cwd(), "public", "photoSingers", photo));
    }
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "This singer id is not from mongodb" });
    return;
  }

  const singer = await singerModel.findOne({ _id: id });

  if (!singer) {
    if (photo) {
      fs.unlinkSync(path.join(process.cwd(), "public", "photoSingers", photo));
    }
    res.status(httpStatus.NOT_FOUND).json({ message: "Singer not found" });
    return;
  }

  if (singer.createBy !== user._id && !user.isSuperAdmin) {
    if (photo) {
      fs.unlinkSync(path.join(process.cwd(), "public", "photoSingers", photo));
    }
    res.status(httpStatus.BAD_REQUEST).json({
      message: "This reader can only be modified by the person who created it",
    });
    return;
  }

  if (photo) {
    fs.unlinkSync(path.join(process.cwd(), "public", singer.photo));
  }

  await singerModel.updateOne(
    { _id: id },
    {
      englishName,
      fullName,
      nationality,
      nickname,
      photo: photo ? `/photoSingers/${photo}` : singer.photo,
    }
  );

  res.json({ message: "Updated singer successfully" });
};
export let remove = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const { user } = req as any;
  if (!isValidObjectId(id)) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "This singer id is not from mongodb" });
    return;
  }

  const singer = await singerModel.findOne({ _id: id });

  if (!singer) {
    res.status(httpStatus.NOT_FOUND).json({ message: "Singer not found" });
    return;
  }

  if (singer.createBy !== user._id && !user.isSuperAdmin) {
    res.status(httpStatus.BAD_REQUEST).json({
      message: "This reader can only be removed by the person who created it",
    });
    return;
  }

  const singerMusics = await musicModel.find({ artist: id }).lean();
  const signerAlbums = await albumModel.find({ artist: id }).lean();
  const upcomingMusic = await upcomingModel.find({ artist: id }).lean();
  const musicIds = singerMusics.map((music) => music._id);

  await musicModel.deleteMany({ artist: id }); //accept
  await albumModel.deleteMany({ artist: id }); //accept
  await archiveModel.deleteMany({ artist: id }); //accept
  await upcomingModel.deleteMany({ artist: id }); //accept
  await criticismModel.deleteMany({ target_id: id }); //accept
  await commentModel.deleteMany({ music: { $in: musicIds } }); //accept
  await palyListModel.updateMany({ musics: id }, { $pull: { musics: id } }); //accept
  await userFavoriteModel.deleteMany({ target_id: { $in: musicIds } }); //accept

  //remove music and cover
  for (let music of singerMusics) {
    fs.unlinkSync(path.join(__dirname, "../", "public", music.download_link));
    fs.unlinkSync(path.join(__dirname, "../", "public", music.cover_image));
  }
  //remove photo album
  for (let album of signerAlbums) {
    fs.unlinkSync(path.join(__dirname, "../", "public", album.photo));
  }
  //remove cover music upcoming
  for (let music of upcomingMusic) {
    if (music.cover_image)
      fs.unlinkSync(path.join(__dirname, "../", "public", music.cover_image));
  }

  fs.unlinkSync(path.join(__dirname, "../", "public", singer.photo));

  await singerModel.deleteOne({ _id: singer._id });

  res.json({ message: "Deleted singer successfully" });
};
export let popular = async (req: express.Request, res: express.Response) => {
  const singers = await singerModel
    .find({})
    .select("-__v")
    .populate("musicStyle", "-__v")
    .populate("album", "title")
    .lean();

  const popularSingers = singers.sort((a, b) => b.count_likes - a.count_likes);

  res.json(popularSingers);
};
export let getOne = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "This singer id is not from mongodb" });
    return;
  }

  const singer = await singerModel
    .findOne({ _id: id })
    .populate("musicStyle", "-__v")
    .populate("album", "title")
    .populate("createBy", "name username profile")
    .select("-__v")
    .lean();

  if (!singer) {
    res.status(httpStatus.NOT_FOUND).json({ message: "Singer not found" });
    return;
  }

  res.json(singer);
};
export let like = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "This singer id is not from mongodb" });
    return;
  }

  const singer = await singerModel
    .findByIdAndUpdate(id, { $inc: { count_likes: 1 } })
    .lean();

  if (!singer) {
    res.status(httpStatus.NOT_FOUND).json({ message: "Singer not found" });
    return;
  }

  res.json({ message: "Singer licked successfully" });
};
