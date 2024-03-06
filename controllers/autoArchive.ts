import { Request, Response, NextFunction } from "express";
import pagination from "../helpers/pagination";
import autoArchiveModel from "../models/autoArchive";
import httpErrors from "http-errors";
import { isValidObjectId } from "mongoose";

export let getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = autoArchiveModel.find();

    const data = await pagination(req, query, autoArchiveModel);

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
      throw httpErrors.BadRequest("This autoArchie id is not from mongodb");
    }

    const existingAutoArchive = await autoArchiveModel.findById(id);

    if (!existingAutoArchive) {
      throw httpErrors.NotFound("Auto archive not found");
    }

    res.json(existingAutoArchive);
  } catch (error) {
    next(error);
  }
};
