import { NextFunction, Request, Response } from "express";
import { ArchiveBody } from "../interfaces/archive";
import httpStatus from "http-status";
import archiveModel from "../models/archive";
import httpErrors from "http-errors";
import pagination from "../helpers/pagination";

export let create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as ArchiveBody;
    const { user } = req as any;
    const photo = req.file?.filename;

    const archive = await archiveModel.findOne({ title: body.title });

    if (archive) {
      throw httpErrors.Conflict("This archive already exists");
    }

    await archiveModel.create({
      ...body,
      createBy: user._id,
      cover_image: photo && `/archiveCovers/${photo}`,
    });

    res
      .status(httpStatus.CREATED)
      .json({ message: "Create archive successfully" });
  } catch (error) {
    next(error);
  }
};
export let getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = archiveModel
      .find()
      .populate("createBy", "name username profile")
      .populate("genre", "title description")
      .populate("country", "title description image")
      .populate({
        path: "musics",
        select: "-__v",
        populate: [{ path: "artist" }],
      })
      .select("-__v")
      .lean();
    const data = await pagination(req, query, archiveModel);

    if (data.error) {
      throw httpErrors(data?.error?.status || 400, data.error?.message || "");
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};
