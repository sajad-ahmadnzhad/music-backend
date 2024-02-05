import { Request, Response, NextFunction } from "express";
import { upcomingBody } from "../interfaces/upcoming";
import upcomingModel from "../models/upcoming";
import httpStatus from "http-status";
import httpErrors from "http-errors";
import fs from "fs";
import path from "path";
import { isValidObjectId } from "mongoose";
export let create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as upcomingBody;
    const coverName = req.file?.filename;

    const upcomingMusic = await upcomingModel.findOne({
      title: body.title,
      artist: body.artist,
    });

    if (upcomingMusic) {
      throw httpErrors.Conflict("This upcoming music already exists");
    }

    await upcomingModel.create({
      ...body,
      cover_image: coverName && `/upcomingCovers/${coverName}`,
      createBy: (req as any).user._id,
    });

    res
      .status(httpStatus.CREATED)
      .json({ message: "Create new upcoming successfully" });
  } catch (error) {
    next(error);
  }
};
export let getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allUpcoming = await upcomingModel
      .find()
      .populate("artist", "fullName photo")
      .populate("genre", "title description")
      .populate("createBy", "name username profile")
      .lean();
    allUpcoming.sort((a: any, b: any) => b.createdAt - a.createdAt);
    res.json(allUpcoming);
  } catch (error) {
    next(error);
  }
};
export let remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { user } = req as any;

    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("upcoming id is not from mongodb");
    }

    const upcoming = await upcomingModel.findById(id);

    if (!upcoming) {
      throw httpErrors.NotFound("upcoming not found");
    }

    if (user._id !== upcoming.createBy && !user.isSuperAdmin) {
      throw httpErrors.Forbidden(
        "This upcoming can only be remove by the person who created it"
      );
    }

    if (upcoming.cover_image) {
      fs.unlinkSync(path.join(process.cwd(), "public", upcoming.cover_image));
    }
    await upcomingModel.findByIdAndDelete(id);

    res.json({ message: "Deleted upcoming successfully" });
  } catch (error) {
    next(error);
  }
};
export let update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const body = req.body as upcomingBody;
    const { user } = req as any;
    const cover = req.file?.filename;

    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("upcoming id is not from mongodb");
    }

    const upcoming = await upcomingModel.findById(id);

    if (!upcoming) {
      throw httpErrors.NotFound("upcoming not found");
    }

    if (user._id !== upcoming.createBy && !user.isSuperAdmin) {
      throw httpErrors.Forbidden(
        "This upcoming can only be modified by the person who created it"
      );
    }

    if (cover && upcoming.cover_image) {
      fs.unlinkSync(path.join(process.cwd(), "public", upcoming.cover_image));
    }
    await upcomingModel.findByIdAndUpdate(id, {
      ...body,
      cover_image: cover && `/upcomingCovers/${cover}`,
    });

    res.json({ message: "Updated upcoming successfully" });
  } catch (error) {
    next(error);
  }
};
export let getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("upcoming id is not from mongodb");
    }

    const upcoming = await upcomingModel
      .findById(id)
      .populate("artist", "fullName photo")
      .populate("genre", "title description")
      .populate("createBy", "name username profile")
      .lean();

    if (!upcoming) {
      httpErrors.NotFound("upcoming not found");
    }

    res.json(upcoming);
  } catch (error) {
    next(error);
  }
};
export let search = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { upcoming } = req.query;
    if (!upcoming) {
      throw httpErrors.BadRequest("upcoming title is required");
    }

    const upcomingResult = await upcomingModel.find({
      title: { $regex: upcoming },
    });

    res.json(upcomingResult);
  } catch (error) {
    next(error);
  }
};
