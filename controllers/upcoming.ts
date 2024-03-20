import { Request, Response, NextFunction } from "express";
import { upcomingBody } from "../interfaces/upcoming";
import upcomingModel from "../models/upcoming";
import musicModel from "../models/music";
import httpStatus from "http-status";
import httpErrors from "http-errors";
import pagination from "../helpers/pagination";
import countryModel from "../models/country";
import genreModel from "../models/genre";
import commentModel from "../models/comment";
import singerModel from "../models/singer";
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

    const music = await musicModel.findOne({
      title: body.title,
      artist: body.artist,
    });

    if (music) {
      throw httpErrors.Conflict("This music is already in the music list");
    }

    const singer = await singerModel.findById(body.artist);

    await upcomingModel.create({
      ...body,
      cover_image: coverName && `/upcomingCovers/${coverName}`,
      createBy: (req as any).user._id,
      country: singer!.country,
      genre: body.genre || singer!.musicStyle,
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
    const query = upcomingModel
      .find()
      .populate("artist", "fullName photo")
      .populate("genre", "title description")
      .populate("country", "title description image")
      .populate("createBy", "name username profile")
      .sort({ createdAt: "desc" })
      .select("-__v")
      .lean();

    const data = await pagination(req, query, upcomingModel);

    if (data.error) {
      throw httpErrors(data?.error?.status || 400, data.error?.message || "");
    }

    res.json(data);
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

    if (String(user._id) !== String(upcoming.createBy) && !user.isSuperAdmin) {
      throw httpErrors.Forbidden(
        "This upcoming can only be remove by the person who created it"
      );
    }

    await upcomingModel.deleteOne({ _id: id });
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

    if (String(user._id) !== String(upcoming.createBy) && !user.isSuperAdmin) {
      throw httpErrors.Forbidden(
        "This upcoming can only be modified by the person who created it"
      );
    }

    const existingUpcoming = await upcomingModel.findOne({
      title: body.title,
      artist: body.artist,
    });

    if (existingUpcoming && existingUpcoming._id.toString() !== id) {
      throw httpErrors.Conflict(
        "Upcoming with this name and artist already exists"
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
      .populate("country", "title description image")
      .populate("createBy", "name username profile")
      .sort({ createdAt: "desc" })
      .select("-__v")
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

    const query = upcomingModel
      .find({
        title: { $regex: upcoming },
      })
      .populate("artist", "fullName photo")
      .populate("genre", "title description")
      .populate("country", "title description image")
      .populate("createBy", "name username profile")
      .sort({ createdAt: "desc" })
      .select("-__v")
      .lean();

    const data = await pagination(req, query, upcomingModel);

    if (data.error) {
      throw httpErrors(data?.error?.status || 400, data.error?.message || "");
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};
export let getByCounty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { countryId } = req.params;

    if (!isValidObjectId(countryId)) {
      throw httpErrors.BadRequest("Country id is not from mongodb");
    }
    const country = await countryModel.findById(countryId);

    if (!country) {
      throw httpErrors.NotFound("Country not found");
    }

    const upcoming = await upcomingModel
      .find({
        country: countryId,
      })
      .populate("artist", "fullName photo")
      .populate("genre", "title description")
      .populate("country", "title description image")
      .populate("createBy", "name username profile")
      .sort({ createdAt: "desc" })
      .select("-__v")
      .lean();

    res.json(upcoming);
  } catch (error) {
    next(error);
  }
};
export let related = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("This upcoming id is not from mongodb");
    }

    const existingUpcoming = await upcomingModel.findById(id);

    if (!existingUpcoming) {
      throw httpErrors.NotFound("Upcoming not found");
    }

    const relatedUpcoming = await upcomingModel
      .find({ artist: existingUpcoming.artist, _id: { $ne: id } })
      .populate("artist", "fullName photo")
      .populate("genre", "title description")
      .populate("country", "title description image")
      .populate("createBy", "name username profile")
      .sort({ createdAt: "desc" })
      .select("-__v")
      .lean()
      .limit(10);

    res.json(relatedUpcoming);
  } catch (error) {
    next(error);
  }
};
export let getByGenre = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { genreId } = req.params;

    if (!isValidObjectId(genreId)) {
      throw httpErrors.BadRequest("Genre id is not from mongodb");
    }

    const genre = await genreModel.findById(genreId);

    if (!genre) {
      throw httpErrors.NotFound("Genre not found");
    }

    const upcoming = await upcomingModel
      .find({
        genre: genreId,
      })
      .populate("artist", "fullName photo")
      .populate("genre", "title description")
      .populate("country", "title description image")
      .populate("createBy", "name username profile")
      .sort({ createdAt: "desc" })
      .select("-__v")
      .lean();

    res.json(upcoming);
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
    const body = req.body as upcomingBody;

    const upcomingMusic = await upcomingModel.findOne({
      title: body.title,
      artist: body.artist,
    });

    if (upcomingMusic) {
      throw httpErrors.Conflict("This upcoming music already exists");
    }

    const music = await musicModel.findOne({
      title: body.title,
      artist: body.artist,
    });

    if (music) {
      throw httpErrors.Conflict("This music is already in the music list");
    }

    res.json({ message: "Validation was successful" });
  } catch (error) {
    next(error);
  }
};
export let myUpcoming = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = req as any;
    const query = upcomingModel
      .find({ createBy: user._id })
      .populate("artist", "fullName photo")
      .populate("genre", "title description")
      .populate("country", "title description image")
      .populate("createBy", "name username profile")
      .sort({ createdAt: "desc" })
      .select("-__v")
      .lean();

    const data = await pagination(req, query, upcomingModel);

    if (data.error) throw data.error;

    res.json(data);
  } catch (error) {
    next(error);
  }
};
