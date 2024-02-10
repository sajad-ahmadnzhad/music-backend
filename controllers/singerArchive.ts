import { Request, Response, NextFunction } from "express";
import singerArchiveModel from "../models/singerArchive";
import { isValidObjectId } from "mongoose";
import httpErrors from "http-errors";
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
export let getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("Singer archive id is not from mongodb");
    }

    const singerArchive = await singerArchiveModel
      .findById(id)
      .populate("musics", "-__v -artist")
      .populate("artist", "fullName englishName photo")
      .select("-__v")
      .lean();

    if (!singerArchive) {
      throw httpErrors.NotFound("Singer archive not found");
    }

    res.json(singerArchive);
  } catch (error) {
    next(error);
  }
};
