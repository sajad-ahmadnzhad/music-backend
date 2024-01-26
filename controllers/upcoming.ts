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
    .populate("createBy", "name username profile")
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
      message: "This upcoming can only be remove by the person who created it",
    });
    return;
  }

  if (upcoming.cover_image) {
    fs.unlinkSync(path.join(process.cwd(), "public", upcoming.cover_image));
  }
  await upcomingModel.findByIdAndDelete(id);

  res.json({ message: "Deleted upcoming successfully" });
};
export let update = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const { title, artist, genre, description, release_date } =
    req.body as upcomingBody;

  const { user } = req as any;
  const cover = req.file?.filename;
  if (!isValidObjectId(id)) {
    if (cover) {
      fs.unlinkSync(
        path.join(process.cwd(), "public", "upcomingCovers", cover)
      );
    }
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "upcoming id is not from mongodb" });
    return;
  }

  const upcoming = await upcomingModel.findById(id);

  if (!upcoming) {
    if (cover) {
      fs.unlinkSync(
        path.join(process.cwd(), "public", "upcomingCovers", cover)
      );
    }
    res.status(httpStatus.BAD_REQUEST).json({ message: "Upcoming not found" });
    return;
  }

  if (user._id !== upcoming.createBy && !user.isSuperAdmin) {
    if (req.file) {
      fs.unlinkSync(path.join(process.cwd(), "public", req.file.filename));
    }
    res.status(httpStatus.BAD_REQUEST).json({
      message:
        "This upcoming can only be modified by the person who created it",
    });
    return;
  }
  if (cover) {
    if (upcoming.cover_image)
      fs.unlinkSync(path.join(process.cwd(), "public", upcoming.cover_image));
  }
  await upcomingModel.findByIdAndUpdate(id, {
    title,
    artist,
    genre,
    description,
    release_date,
    cover_image: cover && `/upcomingCovers/${cover}`,
  });

  res.json({ message: "Updated upcoming successfully" });
};
export let getOne = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "upcoming id is not from mongodb" });
    return;
  }

  const upcoming = await upcomingModel
    .findById(id)
    .populate("artist", "fullName photo")
    .populate("genre", "title description")
    .populate("createBy", "name username profile")
    .lean();

  if (!upcoming) {
    res.status(httpStatus.BAD_REQUEST).json({ message: "Upcoming not found" });
    return;
  }

  res.json(upcoming);
};
export let search = async (req: express.Request, res: express.Response) => {
  const { upcoming } = req.query;
  if (!upcoming) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "upcoming title is required" });
    return;
  }

  const upcomingResult = await upcomingModel.find({
    title: { $regex: upcoming },
  });

  res.json(upcomingResult)

};
