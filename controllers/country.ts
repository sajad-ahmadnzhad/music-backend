import { NextFunction, Request, Response } from "express";
import { BodyCountry } from "../interfaces/country";
import countryModel from "../models/country";
import httpStatus from "http-status";
import fs from "fs";
import musicModel from "../models/music";
import path from "path";
import { isValidObjectId } from "mongoose";
import { rimrafSync } from "rimraf";
import httpErrors from "http-errors";

export let create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as any;
    const image = req.file?.filename && `/countryImages/${req.file.filename}`;
    const body = req.body as BodyCountry;

    const country = await countryModel.findOne({ title: body.title });

    if (country) {
      throw httpErrors.NotFound("This country already exists");
    }

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
      .select("-__v")
      .lean();
    res.json(countries);
  } catch (error) {
    next(error);
  }
};
export let update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as BodyCountry;
    const { user } = req as any;
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("This country id is not from mongodb");
    }

    const country = await countryModel.findById(id);

    if (!country) {
      throw httpErrors.NotFound("Country not found");
    }

    if (country.createBy !== user._id && !user.isSuperAdmin) {
      throw httpErrors.Forbidden(
        "This country can only be edited by the person who created it"
      );
    }
    const existingCountry = await countryModel.findOne({ title: body.title });
    if (existingCountry && existingCountry._id.toString() !== id) {
      throw httpErrors.Conflict("Country with this name already exists");
    }

    if (req.file?.filename && country.image) {
      fs.unlinkSync(path.join(process.cwd(), "public", country.image));
    }

    const image = req.file?.filename && `/countryImages/${req.file.filename}`;

    await countryModel.findByIdAndUpdate(id, {
      ...body,
      image,
    });

    res.json({ message: "Country updated successfully" });
  } catch (error) {
    next(error);
  }
};
export let remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { user } = req as any;
    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("This country id is not from mongodb");
    }

    const country = await countryModel.findById(id);

    if (!country) {
      throw httpErrors.NotFound("Country not found");
    }

    if (country.createBy !== user._id && !user.isSuperAdmin) {
      throw httpErrors.Forbidden(
        "This country can only be deleted by the person who created it"
      );
    }

    if (country.image) {
      fs.unlinkSync(path.join(process.cwd(), "public", country.image));
    }

    const musics = await musicModel.find({ country: id });
    const paths = path.join(process.cwd(), "public");
    const musicPaths = musics.flatMap((music) => [
      `${paths}${music.download_link}`,
      `${paths}${music.cover_image}`,
    ]);

    rimrafSync(musicPaths);
    await countryModel.findByIdAndDelete(id);
    await musicModel.deleteMany({ country: id });
    res.json({ message: "Deleted country successfully" });
  } catch (error) {
    next(error);
  }
};
export let getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("This country id is not from mongodb");
    }

    const country = await countryModel
      .findById(id)
      .populate("createBy", "name username profile")
      .select("-__v")
      .lean();

    if (!country) {
      throw httpErrors.NotFound("Country not found");
    }

    res.json(country);
  } catch (error) {
    next(error);
  }
};
export let search = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { country } = req.query;

    if (!country) {
      throw httpErrors.BadRequest("Country is required");
    }

    const foundCountry = await countryModel
      .find({
        title: { $regex: country },
      })
      .populate("createBy", "name username profile")
      .select("-__v")
      .lean();

    res.json(foundCountry);
  } catch (error) {
    next(error);
  }
};
