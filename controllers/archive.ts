import { NextFunction, Request, Response } from "express";
import { ArchiveBody } from "../interfaces/archive";
import httpStatus from "http-status";
import archiveModel from "../models/archive";
import httpErrors from 'http-errors';

export let create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as ArchiveBody;
    const { user } = req as any;
    const photo = req.file?.filename;

      const archive = await archiveModel.findOne({title: body.title})

      if (archive) {
          throw httpErrors.BadRequest("This archive already exists");
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
