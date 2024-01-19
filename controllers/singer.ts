import express from "express";
import singerModel from "../models/singer";
import { SingerBody } from "../interfaces/singer";
import { isValidObjectId } from "mongoose";
import categoryModel from "../models/category";
import httpStatus from "http-status";
import fs from "fs";
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
export let search = async (req: express.Request, res: express.Response) => {};
export let update = async (req: express.Request, res: express.Response) => {};
export let remove = async (req: express.Request, res: express.Response) => {};
