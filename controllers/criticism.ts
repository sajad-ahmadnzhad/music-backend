import { NextFunction, Request, Response } from "express";
import { CriticismBody } from "../interfaces/criticism";
import criticismModel from "../models/criticism";
import musicModel from "../models/music";
import singerModel from "../models/singer";
import httpStatus from "http-status";
import httpErrors from "http-errors";

export let create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as CriticismBody;
    const { user } = req as any;

    const music = await musicModel.findById(body.target_id);
    const singer = await singerModel.findById(body.target_id);
    if (body.type === "music" && !music) {
      throw httpErrors.BadRequest("Music not found");
    } else if(body.type === 'singer' && !singer) {
      throw httpErrors.BadRequest("Singer not found");
      }

    await criticismModel.create({ ...body, user: user._id });

    res
      .status(httpStatus.CREATED)
      .json({ message: "Create criticism successfully" });
  } catch (error) {
    next(error);
  }
};
