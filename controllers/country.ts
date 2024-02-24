import { NextFunction, Request, Response } from "express";
import { BodyCountry } from "../interfaces/country";
import countryModel from "../models/country";
import httpStatus from "http-status";
import { isValidObjectId } from "mongoose";
import httpErrors from "http-errors";

export let create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as any;
    const image = req.file?.filename && `/countryImages/${req.file.filename}`;
    const body = req.body as BodyCountry;

    await countryModel.create({
      ...body,
      image,
      createBy: user._id,
    });

    res
      .status(httpStatus.CREATED)
      .json({ message: "Create country successfully" });
  } catch (error) {
    next(error);
  }
};

export let getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const countries = await countryModel
      .find()
      .populate("createBy", "name username profile")
      .lean();
    res.json(countries);
  } catch (error) {
    next(error);
  }
};
