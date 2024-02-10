import { Request, Response, NextFunction } from "express";
import singerArchiveModel from "../models/singerArchive";
export let getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const singersArchive = await singerArchiveModel
      .find()
      .populate("musics", "-__v -artist")
      .populate("artist", "fullName englishName photo")
      .select("-__v")
      .lean();
    res.json(singersArchive);
  } catch (error) {
    next(error);
  }
};
