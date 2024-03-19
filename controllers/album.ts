import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import albumModel from "../models/album";
import singerModel from "../models/singer";
import musicModel from "../models/music";
import { AlbumBody } from "../interfaces/album";
import fs from "fs";
import path from "path";
import pagination from "../helpers/pagination";
import httpErrors from "http-errors";
import { isValidObjectId } from "mongoose";

export let create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, artist } = req.body as AlbumBody;
    const { user } = req as any;
    if (!req.file) {
      throw httpErrors.BadRequest("album photo is required");
    }

    const existingAlbum = await albumModel.findOne({ artist, title });

    if (existingAlbum) {
      throw httpErrors.Conflict("This album already exists");
    }

    const album = await albumModel.create({
      title,
      description,
      artist,
      photo: `/albumPhotos/${req.file.filename}`,
      createBy: user._id,
    });
    await singerModel.findByIdAndUpdate(artist, {
      $push: {
        album: album._id,
      },
    });
    res
      .status(httpStatus.CREATED)
      .json({ message: "Create new album successfully" });
  } catch (error) {
    next(error);
  }
};
export let getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = albumModel
      .find()
      .populate("artist", "fullName englishName photo")
      .populate("musics", "title duration download_link cover_image")
      .populate("createBy", "name username profile")
      .select("-__v")
      .sort({ createdAt: "desc" })
      .lean();

    const data = await pagination(req, query, albumModel);

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
      throw httpErrors.BadRequest("This album id is not from mongodb");
    }

    const album = await albumModel.findById(id);

    if (!album) {
      throw httpErrors.NotFound("Album not found");
    }

    if (String(user._id) !== String(album.createBy) && !user.isSuperAdmin) {
      throw httpErrors.BadRequest(
        "This album can only be removed by the person who created it"
      );
    }

    await albumModel.deleteOne({ _id: id });

    res.json({ message: "Deleted album successfully" });
  } catch (error) {
    next(error);
  }
};
export let update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { user } = req as any;
    const { title, artist, description } = req.body as AlbumBody;
    const photo = req.file?.filename;
    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("This album id is not from mongodb");
    }

    const album = await albumModel.findById(id);

    if (!album) {
      throw httpErrors.NotFound("Album not found");
    }

    if (String(user._id) !== String(album.createBy) && !user.isSuperAdmin) {
      throw httpErrors.NotFound(
        "This album can only be modified by the person who created it"
      );
    }

    const existingAlbum = await albumModel.findOne({
      title,
      artist,
    });

    if (existingAlbum && existingAlbum._id.toString() !== id) {
      throw httpErrors.Conflict(
        "Album with this name and artist already exists"
      );
    }

    if (photo) {
      fs.unlinkSync(path.join(process.cwd(), "public", album.photo));
    }

    await albumModel.updateOne(
      { _id: id },
      {
        title,
        description,
        artist,
        photo: photo && `/albumPhotos/${photo}`,
      }
    );

    res.json({ message: "Updated album successfully" });
  } catch (error) {
    next(error);
  }
};
export let getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("This album id is not from mongodb");
    }

    const album = await albumModel
      .findById(id)
      .populate("artist", "fullName englishName photo")
      .populate("musics", "title duration download_link cover")
      .populate("createBy", "name username profile")
      .select("-__v")
      .lean();

    if (!album) {
      throw httpErrors.NotFound("Album not found");
    }

    res.json(album);
  } catch (error) {
    next(error);
  }
};
export let search = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { album } = req.query;

    if (!album) {
      throw httpErrors.BadRequest("album title is required");
    }

    const query = albumModel
      .find({ title: { $regex: album } })
      .populate("artist", "fullName englishName photo")
      .populate("musics", "title duration download_link cover")
      .populate("createBy", "name username profile")
      .select("-__v")
      .lean();

    const data = await pagination(req, query, albumModel);

    if (data.error) {
      throw httpErrors(data?.error?.status || 400, data.error?.message || "");
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};
export let addMusic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { albumId } = req.params;
    const { musicId } = req.body;
    const { user } = req as any;

    if (!musicId) {
      throw httpErrors.BadRequest("MusicId is required");
    }

    if (!isValidObjectId(musicId) || !isValidObjectId(albumId)) {
      throw httpErrors.BadRequest("Album id or music id is not from mongodb");
    }

    const music = await musicModel.findById(musicId);

    if (!music) {
      throw httpErrors.NotFound("Music not found");
    }

    const album = await albumModel.findById(albumId);

    if (!album) {
      throw httpErrors.NotFound("Album not found");
    }

    if (String(user._id) !== String(album.createBy) && !user.isSuperAdmin) {
      throw httpErrors.BadRequest(
        "Only the person who created this album can add music to it"
      );
    }

    if (String(music.artist) !== String(album.artist)) {
      throw httpErrors.BadRequest(
        "Another singer's music cannot be added to the album"
      );
    }

    const albums = await albumModel.find().lean();
    let isMusicInAlbum = albums.some((album) =>
      album.musics.some((music) => music.toString() == musicId)
    );

    if (isMusicInAlbum) {
      throw httpErrors.NotFound(
        "This music has already been included in one of the albums"
      );
    }

    await albumModel.findByIdAndUpdate(albumId, {
      $addToSet: { musics: musicId },
    });
    await music.updateOne({ isSingle: false });
    res.json({ message: "Added music to album successfully" });
  } catch (error) {
    next(error);
  }
};
export let removeMusic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { albumId } = req.params;
    const { musicId } = req.body;
    const { user } = req as any;

    if (!musicId) {
      throw httpErrors.BadRequest("musicId is required");
    }

    if (!isValidObjectId(musicId) || !isValidObjectId(albumId)) {
      throw httpErrors.BadRequest("album id or music id is not from mongodb");
    }

    const music = await musicModel.findById(musicId);

    if (!music) {
      throw httpErrors.NotFound("Music not found");
    }

    const album = await albumModel.findById(albumId);

    if (!album) {
      throw httpErrors.NotFound("Album not found");
    }

    if (String(user._id) !== String(album.createBy) && !user.isSuperAdmin) {
      throw httpErrors.BadRequest(
        "Only the person who created this album can remove music"
      );
    }

    await albumModel.findByIdAndUpdate(albumId, {
      $pull: { musics: musicId },
    });
    await music.updateOne({ isSingle: true });

    res.json({ message: "Deleted music from album successfully" });
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
      throw httpErrors.BadRequest("This album id is not from mongodb");
    }

    const album = await albumModel.findById(id);

    if (!album) {
      throw httpErrors.NotFound("Album not found");
    }

    const relatedAlbum = await albumModel
      .find({ artist: album.artist, _id: { $ne: id } })
      .populate("artist", "fullName englishName photo")
      .populate("musics", "title duration download_link cover_image")
      .populate("createBy", "name username profile")
      .select("-__v")
      .sort({ createdAt: "desc" })
      .limit(10)
      .lean();

    res.json(relatedAlbum);
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
    const { artist, title } = req.body as AlbumBody
    
    const existingAlbum = await albumModel.findOne({ artist, title });

    if (existingAlbum) {
      throw httpErrors.Conflict("This album already exists");
    }
    res.json({message: 'Validation was successful'})
  } catch (error) {
    next(error);
  }
};
