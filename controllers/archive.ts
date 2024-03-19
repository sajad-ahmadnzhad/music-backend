import { NextFunction, Request, Response } from "express";
import { ArchiveBody } from "../interfaces/archive";
import httpStatus from "http-status";
import archiveModel from "../models/archive";
import httpErrors from "http-errors";
import pagination from "../helpers/pagination";
import { isValidObjectId } from "mongoose";
import path from "path";
import { rimrafSync } from "rimraf";

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
      .sort({ createdAt: -1 })
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
export let update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const body = req.body as ArchiveBody;
    const { user } = req as any;
    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("This archive id is not from mongodb");
    }

    const existingArchive = await archiveModel.findById(id);

    if (!existingArchive) {
      throw httpErrors.NotFound("Archive not found");
    }

    if (String(user._id) !== String(existingArchive.createBy)) {
      throw httpErrors.BadRequest(
        "The archive can only be edited by the person who created it"
      );
    }

    const existingArchiveTitle = await archiveModel.findOne({
      title: body.title,
    });

    if (
      existingArchiveTitle &&
      id !== String(existingArchiveTitle._id) &&
      !user.isSuperAdmin
    ) {
      throw httpErrors.Conflict("This archive title already exists");
    }

    if (req.file && existingArchive.cover_image) {
      const publicFolder = path.join(process.cwd(), "public");
      rimrafSync(`${publicFolder}${existingArchive.cover_image}`);
    }

    await archiveModel.findByIdAndUpdate(id, {
      ...body,
      cover_image: req.file && `/archiveCovers/${req.file.filename}`,
    });

    res.json({ message: "Updated archive successfully" });
  } catch (error) {
    next(error);
  }
};
export let remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { user } = req as any;

    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("This archive id is not from mongodb");
    }

    const existingArchive = await archiveModel.findById(id);

    if (!existingArchive) {
      throw httpErrors.NotFound("Archive not found");
    }

    if (
      String(user._id) !== String(existingArchive.createBy) &&
      !user.isSuperAdmin
    ) {
      throw httpErrors.BadRequest(
        "The archive can only be deleted by the person who created it"
      );
    }

    if (existingArchive.cover_image) {
      const publicFolder = path.join(process.cwd(), "public");
      rimrafSync(`${publicFolder}${existingArchive.cover_image}`);
    }

    await archiveModel.findByIdAndDelete(id);
    res.json({ message: "Deleted archive successfully" });
  } catch (error) {
    next(error);
  }
};
export let validation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body as ArchiveBody;

    const archive = await archiveModel.findOne({ title: body.title });

    if (archive) {
      throw httpErrors.Conflict("This archive already exists");
    }

    res.json({ message: "Validation was successful" });
  } catch (error) {
    next(error);
  }
};
