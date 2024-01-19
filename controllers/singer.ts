import express from "express";
import singerModel from "../models/singer";
import { SingerBody } from "../interfaces/singer";
import { isValidObjectId } from "mongoose";
import categoryModel from "../models/category";
import httpStatus from "http-status";
import fs from "fs";
import path from "path";
export let getAll = async (req: express.Request, res: express.Response) => {
  const singers = await singerModel
    .find()
    .populate("musicStyle", "-__v")
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
    .populate("musicStyle", "-__v");

  if (!foundArtists) {
    res.status(httpStatus.NOT_FOUND).json({ message: "Artist not found" });
    return;
  }

  if (foundArtists.albums.length) {
    await foundArtists.populate("albums", "-__v");
  }

  res.json(foundArtists);
};
export let update = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const { englishName, fullName, nationality, nickname } =
    req.body as SingerBody;

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

  if (req.file) {
    fs.unlinkSync(path.join(__dirname, "../", "public", singer.photo));
  }

  const updatedSinger = await singerModel.findByIdAndUpdate(
    id,
    {
      englishName,
      fullName,
      nationality,
      nickname,
      photo: req.file ? `/photoSingers/${req.file.filename}` : singer.photo,
    },
    { new: true }
  );

  res.json({ message: "Updated singer successfully", updatedSinger });
};
export let remove = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;

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

  fs.unlinkSync(path.join(__dirname, "../", "public", singer.photo));

  await singerModel.deleteOne({ _id: singer._id });

  res.json({ message: "Deleted singer successfully" });
};