import express from "express";
import httpStatus from "http-status";
import albumModel from "../models/album";
import playListModel from "../models/playList";
import singerModel from "../models/singer";
import musicModel from "../models/music";
import userFavoriteModel from "../models/userFavorite";
import { AlbumBody } from "../interfaces/album";
import fs from "fs";
import path from "path";
import { isValidObjectId } from "mongoose";

export let create = async (req: express.Request, res: express.Response) => {
  const { title, description, artist } = req.body as AlbumBody;
  const { user } = req as any;
  if (!req.file) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "album photo is required" });
    return;
  }

  const album = await albumModel.findOne({ artist, title });

  if (album) {
    fs.unlinkSync(
      path.join(process.cwd(), "public", "albumPhotos", req.file.filename)
    );
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "This album already exists" });
    return;
  }

  await albumModel.create({
    title,
    description,
    artist,
    photo: `/albumPhotos/${req.file.filename}`,
    createBy: user._id,
  });

  res
    .status(httpStatus.CREATED)
    .json({ message: "Create new album successfully" });
};
export let getAll = async (req: express.Request, res: express.Response) => {
  const albums = await albumModel
    .find()
    .populate("artist", "fullName englishName photo")
    .populate("musics", "title duration download_link cover")
    .populate("createBy", "name username profile")
    .select("-__v")
    .lean();

  res.json(albums);
};
export let remove = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const { user } = req as any;
  if (!isValidObjectId(id)) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "This album id is not from mongodb" });
    return;
  }

  const album = await albumModel.findById(id);

  if (!album) {
    res.status(httpStatus.NOT_FOUND).json({ message: "album not found" });
    return;
  }

  if (user._id !== album.createBy && !user.isSuperAdmin) {
    res.status(httpStatus.BAD_REQUEST).json({
      message: "This album can only be removed by the person who created it",
    });
    return;
  }

  fs.unlinkSync(path.join(process.cwd(), "public", album.photo));

  await albumModel.deleteOne({ _id: id });

  await playListModel.updateOne({ albums: id }, { $pull: { albums: id } });

  await singerModel.updateOne({ albums: id }, { $pull: { albums: id } });

  await userFavoriteModel.deleteOne({ target_id: id });

  res.json({ message: "Deleted album successfully" });
};
export let update = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const { user } = req as any;
  const { title, artist, description } = req.body as AlbumBody;
  const photo = req.file?.filename;
  if (!isValidObjectId(id)) {
    if (photo) {
      fs.unlinkSync(path.join(process.cwd(), "public", "albumPhotos", photo));
    }
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "This album id is not from mongodb" });
    return;
  }

  const album = await albumModel.findById(id);

  if (!album) {
    if (photo) {
      fs.unlinkSync(path.join(process.cwd(), "public", "albumPhotos", photo));
    }
    res.status(httpStatus.NOT_FOUND).json({ message: "album not found" });
    return;
  }

  if (user._id !== album.createBy && !user.isSuperAdmin) {
    if (photo) {
      fs.unlinkSync(path.join(process.cwd(), "public", "albumPhotos", photo));
    }
    res.status(httpStatus.BAD_REQUEST).json({
      message: "This album can only be modified by the person who created it",
    });
    return;
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
      photo: photo ? `/albumPhotos/${photo}` : album.photo,
    }
  );

  res.json({ message: "updated album successfully" });
};
export let getOne = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "This album id is not from mongodb" });
    return;
  }

  const album = await albumModel
    .findById(id)
    .populate("artist", "fullName englishName photo")
    .populate("musics", "title duration download_link cover")
    .populate("createBy", "name username profile")
    .select("-__v")
    .lean();

  if (!album) {
    res.status(httpStatus.NOT_FOUND).json({ message: "album not found" });
    return;
  }

  res.json(album);
};
export let search = async (req: express.Request, res: express.Response) => {
  const { album } = req.query;

  if (!album) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "album title is required" });
    return;
  }

  const foundAlbum = await albumModel
    .find({ title: { $regex: album } })
    .populate("artist", "fullName englishName photo")
    .populate("musics", "title duration download_link cover")
    .populate("createBy", "name username profile")
    .select("-__v")
    .lean();

  res.json(foundAlbum);
};
export let addMusic = async (req: express.Request, res: express.Response) => {
  const { albumId } = req.params;
  const { musicId } = req.body;
  const { user } = req as any;

  if (!musicId) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "musicId is required" });
    return;
  }

  if (!isValidObjectId(musicId) || !isValidObjectId(albumId)) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "album id or music id is not from mongodb" });
    return;
  }

  const music = await musicModel.findById(musicId);

  if (!music) {
    res.status(httpStatus.NOT_FOUND).json({ message: "Music not found" });
    return;
  }

  const album = await albumModel.findById(albumId);

  if (!album) {
    res.status(httpStatus.NOT_FOUND).json({ message: "Album not found" });
    return;
  }

  if (user._id !== album.createBy && !user.isSuperAdmin) {
    res.status(httpStatus.BAD_REQUEST).json({
      message: "Only the person who created this album can add music to it",
    });
    return;
  }

  if (album.musics.includes(musicId)) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "This music is already in the album" });
    return;
  }

  await albumModel.findByIdAndUpdate(albumId, {
    $addToSet: { musics: musicId },
  });

  res.json({ message: "Added music to album successfully" });
};
