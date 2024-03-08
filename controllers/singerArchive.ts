import { Request, Response, NextFunction } from "express";
import singerArchiveModel from "../models/singerArchive";
import { isValidObjectId } from "mongoose";
import pagination from "../helpers/pagination";
import httpErrors from "http-errors";
export let getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = singerArchiveModel
      .find()
      .populate("musics", "-__v -artist")
      .populate("artist", "fullName englishName photo")
      .populate("albums")
      .select("-__v")
      .sort({ createdAt: "desc" })
      .limit(0)
      .lean();
    
    const data = await pagination(req, query, singerArchiveModel);

    if (data.error) throw data.error;

    res.json(data);
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
