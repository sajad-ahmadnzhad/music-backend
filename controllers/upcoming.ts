import express from "express";
import { upcomingBody } from "../interfaces/upcoming";
import upcomingModel from "../models/upcoming";
import httpStatus from "http-status";
import fs from "fs";
import path from "path";
import { isValidObjectId } from "mongoose";
export let create = async (req: express.Request, res: express.Response) => {
  const { title, artist, genre, description, release_date } =
    req.body as upcomingBody;
  const coverName = req.file?.filename;

  const upcomingMusic = await upcomingModel.findOne({ title, artist });

  if (upcomingMusic) {
    if (coverName) {
      fs.unlinkSync(
        path.join(process.cwd(), "public", "upcomingCovers", coverName)
      );
    }
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "This upcoming music already exists" });
  }

  await upcomingModel.create({
    title,
    artist,
    genre,
    description,
    release_date,
    cover_image: coverName && `/upcomingCovers/${coverName}`,
    createBy: (req as any).user._id,
  });

  res
    .status(httpStatus.CREATED)
    .json({ message: "Create new upcoming successfully" });
};
export let getAll = async (req: express.Request, res: express.Response) => {
  const allUpcoming = await upcomingModel
    .find()
    .populate("artist", "fullName photo")
    .populate("genre", "title description")
    .lean();
  allUpcoming.sort((a: any, b: any) => b.createdAt - a.createdAt);
  res.json(allUpcoming);
};
export let remove = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const { user } = req as any;

  if (!isValidObjectId(id)) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "upcoming id is not from mongodb" });
    return;
  }

  const upcoming = await upcomingModel.findById(id);

  if (!upcoming) {
    res.status(httpStatus.BAD_REQUEST).json({ message: "Upcoming not found" });
    return;
  }

  if (user._id !== upcoming.createBy && !user.isSuperAdmin) {
    if (upcoming.cover_image) {
      fs.unlinkSync(path.join(process.cwd(), "public", upcoming.cover_image));
    }
    res.status(httpStatus.BAD_REQUEST).json({
      message: "This album can only be modified by the person who created it",
    });
    return;
  }

  if (upcoming.cover_image) {
    fs.unlinkSync(path.join(process.cwd(), "public", upcoming.cover_image));
  }
  await upcomingModel.findByIdAndDelete(id);

  res.json({ message: "Deleted upcoming successfully" });
};
