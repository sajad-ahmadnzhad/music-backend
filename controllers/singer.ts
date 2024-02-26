import { Request, Response, NextFunction } from "express";
import singerModel from "../models/singer";
import { SingerBody } from "../interfaces/singer";
import { isValidObjectId } from "mongoose";
import musicModel from "../models/music";
import albumModel from "../models/album";
import archiveModel from "../models/archive";
import singerArchiveModel from "../models/singerArchive";
import commentModel from "../models/comment";
import criticismModel from "../models/criticism";
import palyListModel from "../models/playList";
import userFavoriteModel from "../models/userFavorite";
import upcomingModel from "../models/upcoming";
import httpStatus from "http-status";
import pagination from "../helpers/pagination";
import fs from "fs";
import path from "path";
import httpErrors from "http-errors";
export let getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = singerModel
      .find()
      .populate("musicStyle", "title description")
      .populate("album", "title photo")
      .populate("likes", "name username profile")
      .populate("createBy", "name username profile")
      .select("-__v")
      .sort({ createdAt: "desc" })
      .lean();

    const data = await pagination(req, query, singerModel);

    if (data.error) {
      throw httpErrors(data?.error?.status || 400, data.error?.message || "");
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};
export let create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as SingerBody;

    if (!req.file) {
      throw httpErrors.BadRequest("photo singer is required");
    }

    const singer = await singerModel.findOne({ fullName: body.fullName });
    if (singer) {
      throw httpErrors.BadRequest("This artist already exists");
    }

    const newSinger = await singerModel.create({
      ...body,
      photo: `/photoSingers/${req.file.filename}`,
      createBy: (req as any).user._id,
    });

    await singerArchiveModel.create({
      artist: newSinger._id,
    });

    res
      .status(httpStatus.CREATED)
      .json({ message: "Create singer successfully" });
  } catch (error) {
    next(error);
  }
};
export let search = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { artist } = req.query;

    if (!artist) {
      throw httpErrors.BadRequest(
        "The singer's full name or nickname or English name is mandatory"
      );
    }

    const query = singerModel
      .find({
        $or: [
          { fullName: { $regex: artist } },
          { nickname: { $regex: artist } },
          { englishName: { $regex: artist } },
        ],
      })
      .populate("musicStyle", "title description")
      .populate("album", "title photo")
      .populate("likes", "name username profile")
      .populate("createBy", "name username profile")
      .select("-__v")
      .lean();

    const data = await pagination(req, query, singerModel);

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
    const { user } = req as any;
    const body = req.body as SingerBody;
    const photo = req.file?.filename;

    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("This singer id is not from mongodb");
    }

    const singer = await singerModel.findOne({ _id: id }).lean();

    if (!singer) {
      throw httpErrors.NotFound("Artist not found");
    }

    if (singer.createBy !== user._id && !user.isSuperAdmin) {
      throw httpErrors.BadRequest(
        "This reader can only be modified by the person who created it"
      );
    }

    const existingSinger = await singerModel.findOne({
      fullName: body.fullName,
    });

    if (existingSinger && existingSinger._id.toString() !== id) {
      throw httpErrors.Conflict("Singer with this name already exists");
    }

    if (photo) {
      fs.unlinkSync(path.join(process.cwd(), "public", singer.photo));
    }

    await singerModel.updateOne(
      { _id: id },
      {
        ...body,
        photo: photo && `/photoSingers/${photo}`,
      }
    );

    res.json({ message: "Updated singer successfully" });
  } catch (error) {
    next(error);
  }
};
export let remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { user } = req as any;
    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("This singer id is not from mongodb");
    }

    const singer = await singerModel.findOne({ _id: id });

    if (!singer) {
      throw httpErrors.NotFound("Artist not found");
    }

    if (singer.createBy !== user._id && !user.isSuperAdmin) {
      res.status(httpStatus.BAD_REQUEST).json({
        message: "This reader can only be removed by the person who created it",
      });
      return;
    }

    const singerMusics = await musicModel.find({ artist: id }).lean();
    const signerAlbums = await albumModel.find({ artist: id }).lean();
    const upcomingMusic = await upcomingModel.find({ artist: id }).lean();
    const musicIds = singerMusics.map((music) => music._id);

    await musicModel.deleteMany({ artist: id }); //accept
    await albumModel.deleteMany({ artist: id }); //accept
    await archiveModel.deleteMany({ artist: id }); //accept
    await upcomingModel.deleteMany({ artist: id }); //accept
    await criticismModel.deleteMany({ target_id: id }); //accept
    await commentModel.deleteMany({ music: { $in: musicIds } }); //accept
    await palyListModel.updateMany({ musics: id }, { $pull: { musics: id } }); //accept
    await userFavoriteModel.deleteMany({ target_id: { $in: musicIds } }); //accept

    //remove music and cover
    for (let music of singerMusics) {
      fs.unlinkSync(path.join(process.cwd(), "public", music.download_link));
      fs.unlinkSync(path.join(process.cwd(), "public", music.cover_image));
    }
    //remove photo album
    for (let album of signerAlbums) {
      fs.unlinkSync(path.join(process.cwd(), "public", album.photo));
    }
    //remove cover music upcoming
    for (let music of upcomingMusic) {
      if (music.cover_image)
        fs.unlinkSync(path.join(process.cwd(), "public", music.cover_image));
    }

    fs.unlinkSync(path.join(process.cwd(), "public", singer.photo));

    await singerModel.deleteOne({ _id: singer._id });

    res.json({ message: "Deleted singer successfully" });
  } catch (error) {
    next(error);
  }
};
export let popular = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = singerModel
      .find({})
      .populate("musicStyle", "title description")
      .populate("album", "title photo")
      .populate("likes", "name username profile")
      .populate("createBy", "name username profile")
      .select("-__v")
      .sort({ count_like: -1 })
      .lean();

    const data = await pagination(req, query, singerModel);

    if (data.error) {
      throw httpErrors(data?.error?.status || 400, data.error?.message || "");
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};
export let getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("This singer id is not from mongodb");
    }

    const singer = await singerModel
      .findOne({ _id: id })
      .populate("musicStyle", "-__v")
      .populate("album", "title photo")
      .populate("createBy", "name username profile")
      .populate("likes", "name username profile")
      .select("-__v")
      .lean();

    if (!singer) {
      throw httpErrors.NotFound("Artist not found");
    }

    res.json(singer);
  } catch (error) {
    next(error);
  }
};
export let like = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { user } = req as any;
    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("Singer id is not from mongodb");
    }

    const singer = await singerModel.findById(id);

    if (!singer) {
      throw httpErrors.NotFound("Singer not found");
    }

    if (singer.likes.includes(user._id)) {
      throw httpErrors.Conflict("You have already liked");
    }

    await singerModel.findByIdAndUpdate(id, {
      $addToSet: { likes: user._id },
      $inc: { count_likes: 1 },
    });

    res.json({ message: "Singer licked successfully" });
  } catch (error) {
    next(error);
  }
};
export let unlike = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { user } = req as any;
    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("Singer id is not from mongodb");
    }

    const singer = await singerModel.findById(id);

    if (!singer) {
      throw httpErrors.NotFound("Singer not found");
    }

    if (!singer.likes.includes(user._id)) {
      throw httpErrors.Conflict("You did not like");
    }

    await singerModel.findByIdAndUpdate(id, {
      $pull: { likes: user._id },
      $inc: { count_likes: -1 },
    });

    res.json({ message: "Singer was successfully unliked" });
  } catch (error) {
    next(error);
  }
};
