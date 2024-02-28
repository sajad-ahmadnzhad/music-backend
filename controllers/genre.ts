import { NextFunction, Request, Response } from "express";
import { BodyGenre } from "../interfaces/genre";
import httpStatus from "http-status";
import httpErrors from "http-errors";
import { isValidObjectId } from "mongoose";
import genreModel from "../models/genre";
import categoryModel from "../models/country";
export let create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as BodyGenre;
    const { user } = req as any;

    const genre = await genreModel.findOne({ title: body.title });

    if (genre) {
      throw httpErrors.Conflict("This genre already exists");
    }

    const countCategory = await categoryModel.countDocuments();

    if (!countCategory) {
      throw httpErrors.NotFound("Country not found");
    }

    await genreModel.create({
      ...body,
      createBy: user._id,
    });

    res
      .status(httpStatus.CREATED)
      .json({ message: "Create genre successfully" });
  } catch (error) {
    next(error);
  }
};
export let getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const counties = await genreModel
      .find()
      .populate("createBy", "name username profile")
      .select("-__v")
      .lean();
    res.json(counties);
  } catch (error) {
    next(error);
  }
};
export let update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { user } = req as any;
    const body = req.body as BodyGenre;
    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("genre id is not from mongodb");
    }

    const genre = await genreModel.findById(id).lean();

    if (!genre) {
      throw httpErrors.NotFound("genre not found");
    }

    const existingGenre = await genreModel.findOne({ title: body.title });

    if (existingGenre && existingGenre._id.toString() !== id) {
      throw httpErrors.Conflict("Genre with this name already exists");
    }

    if (genre.createBy !== user._id && !user.isSuperAdmin) {
      throw httpErrors.BadRequest(
        "This genre can only be edited by the person who created it"
      );
    }

    await genreModel.findByIdAndUpdate(id, body);

    res.json({ message: "updated genre successfully" });
  } catch (error) {
    next(error);
  }
};
export let remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { user } = req as any;
    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("genre id is not from mongodb");
    }

    const genre = await genreModel.findById(id).select("-__v").lean();

    if (!genre) {
      throw httpErrors.NotFound("genre not found");
    }

    if (genre.createBy !== user._id && !user.isSuperAdmin) {
      throw httpErrors.BadRequest(
        "This genre can only be deleted by the person who created it"
      );
    }
    await genreModel.deleteOne({ _id: id });
    res.json({ message: "Deleted genre successfully" });
  } catch (error) {
    next(error);
  }
};
export let getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("genre id is not from mongodb");
    }
    const genre = await genreModel
      .findById(id)
      .populate("createBy", "name username profile")
      .select("-__v")
      .lean();

    if (!genre) {
      throw httpErrors.NotFound("genre not found");
    }
    res.json(genre);
  } catch (error) {
    next(error);
  }
};
