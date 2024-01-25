import express from "express";
import { upcomingBody } from "../interfaces/upcoming";
import upcomingModel from "../models/upcoming";
import httpStatus from "http-status";
import fs from "fs";
import path from "path";
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
  });

  res
    .status(httpStatus.CREATED)
    .json({ message: "Create new upcoming successfully" });
};
