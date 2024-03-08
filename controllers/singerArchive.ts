import { Request, Response, NextFunction } from "express";
import singerArchiveModel from "../models/singerArchive";
import { isValidObjectId } from "mongoose";
import pagination from "../helpers/pagination";
import httpErrors from "http-errors";
export let getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = singerArchiveModel.find().lean();

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

    const singerArchive = await singerArchiveModel.findById(id).lean();

    if (!singerArchive) {
      throw httpErrors.NotFound("Singer archive not found");
    }

    res.json(singerArchive);
  } catch (error) {
    next(error);
  }
};
