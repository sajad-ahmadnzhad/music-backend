import { Request, Response, NextFunction } from "express";
import autoArchiveModel from "../models/autoArchive";
export let getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const autoArchives = await autoArchiveModel
      .find()
      .populate("target_ids")
      .populate("country", "title description image")
      .sort({ createdAt: -1 })
      .lean();
    res.json(autoArchives);
  } catch (error) {
    next(error);
  }
};
