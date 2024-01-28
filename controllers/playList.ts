import { Request, Response, NextFunction } from "express";
import { PlayListBody } from "../interfaces/playList";
import httpStatus from "http-status";
import fs from "fs";
import path from "path";
import playListModel from "../models/playList";
import musicModel from "../models/music";
import { isValidObjectId } from "mongoose";
import httpErrors from "http-errors";

export let create = async (req: Request, res: Response, next: NextFunction) => {
  const cover = req.file?.filename;
  try {
    const body = req.body as PlayListBody;
    const { user } = req as any;
    if (!cover) {
      throw httpErrors.BadRequest("cover play list is required");
    }

    const playList = await playListModel.findOne({ title: body.title });

    if (playList) {
      throw httpErrors.BadRequest("This play list already exists");
    }

    await playListModel.create({
      ...body,
      createBy: user._id,
      cover_image: `/playListCovers/${cover}`,
    });

    res
      .status(httpStatus.CREATED)
      .json({ message: "Create play list successfully" });
  } catch (error: any) {
    next(error);
  }
};
export let getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const playLists = await playListModel
      .find({})
      .populate("createBy", "name username profile")
      .populate("musics", "title cover_image download_link")
      .populate("category", "-__v")
      .select("-__v")
      .lean();
    res.json(playLists);
  } catch (error: any) {
    next(error);
  }
};
export let update = async (req: Request, res: Response, next: NextFunction) => {
  const cover = req.file?.filename;
  try {
    const { id } = req.params;
    const body = req.body as PlayListBody;
    const { user } = req as any;

    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("Play list id is not from mongodb");
    }

    const playList = await playListModel.findById(id);

    if (!playList) {
      throw httpErrors.NotFound("Play list not found");
    }

    if (user._id !== playList.createBy && !user.isSuperAdmin) {
      throw httpErrors.BadRequest(
        "This paly list can only be modified by the person who created it"
      );
    }

    if (cover) {
      fs.unlinkSync(path.join(process.cwd(), "public", playList.cover_image));
    }

    await playListModel.findByIdAndUpdate(id, {
      ...body,
      cover_image: cover && `/playListCovers/${cover}`,
    });

    res.json({ message: "Updated play list successfully" });
  } catch (error: any) {
    next(error);
  }
};
export let remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { user } = req as any;
    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("Play list id is not from mongodb");
    }

    const playList = await playListModel.findById(id);

    if (!playList) {
      throw httpErrors.NotFound("Play list not found");
    }

    if (user._id !== playList.createBy && !user.isSuperAdmin) {
      throw httpErrors.BadRequest(
        "This paly list can only be remove by the person who created it"
      );
    }

    if (playList.cover_image) {
      fs.unlinkSync(path.join(process.cwd(), "public", playList.cover_image));
    }
    await playListModel.findByIdAndDelete(id);
    res.json({ message: "Deleted play list successfully" });
  } catch (error: any) {
    next(error);
  }
};
export let like = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("paly list id is not from mongodb");
    }

    const playList = await playListModel.findByIdAndUpdate(id, {
      $inc: { count_likes: 1 },
    });

    if (!playList) {
      throw httpErrors.NotFound("Play list not found");
    }

    res.json({ message: "Liked play list successfully" });
  } catch (error: any) {
    next(error);
  }
};
export let unlike = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("paly list id is not from mongodb");
    }

    const playList = await playListModel.findById(id);

    if (!playList) {
      throw httpErrors.NotFound("Play list not found");
    }

    if (!playList.count_likes) {
      throw httpErrors.BadRequest("This playlist has not been liked yet");
    }

    await playListModel.findByIdAndUpdate(id, {
      $inc: { count_likes: -1 },
    });

    res.json({ message: "Un linked play list successfully" });
  } catch (error: any) {
    next(error);
  }
};
export let view = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("Paly list id is not from mongodb");
    }

    const playList = await playListModel.findByIdAndUpdate(id, {
      $inc: { count_views: 1 },
    });

    if (!playList) {
      throw httpErrors.NotFound("Play list not found");
    }

    res.json({ message: "Playlist was viewed successfully" });
  } catch (error: any) {
    next(error);
  }
};
export let search = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { playList } = req.query;
    if (!playList) {
      throw httpErrors.BadRequest("paly list title is required");
    }

    const foundPlayLists = await playListModel
      .find({
        title: { $regex: playList },
      })
      .populate("createBy", "name username profile")
      .populate("musics", "title cover_image download_link")
      .populate("category", "-__v")
      .select("-__v")
      .lean();

    res.json(foundPlayLists);
  } catch (error: any) {
    next(error);
  }
};
export let getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("Play list id is not from mongodb");
    }

    const playList = await playListModel
      .findById(id)
      .populate("createBy", "name username profile")
      .populate("musics", "title cover_image download_link")
      .populate("category", "-__v")
      .select("-__v")
      .lean();

    if (!playList) {
      throw httpErrors.NotFound("Play list not found");
    }
    res.json(playList);
  } catch (error: any) {
    next(error);
  }
};
export let popular = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const playLists = await playListModel
      .find()
      .populate("createBy", "name username profile")
      .populate("musics", "title cover_image download_link")
      .populate("category", "-__v")
      .select("-__v")
      .lean();
    playLists.sort((a: any, b: any) => b.count_views - a.count_views);
    res.json(playLists);
  } catch (error: any) {
    next(error);
  }
};
export let addMusic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { musicId } = req.body;
    const { playListId } = req.params;
    const { user } = req as any;

    if (!musicId) {
      throw httpErrors.BadRequest("Music id is required");
    }

    if (!isValidObjectId(musicId)) {
      throw httpErrors.BadRequest("Music id is not from mongodb");
    }

    if (!isValidObjectId(playListId)) {
      throw httpErrors.BadRequest("Play list id is not from mongodb");
    }

    const music = await musicModel.findById(musicId);

    if (!music) {
      throw httpErrors.NotFound("Music not found");
    }

    const playList = await playListModel.findById(playListId);

    if (!playList) {
      throw httpErrors.NotFound("Play list not found");
    }

    if (user._id !== playList.createBy && !user.isSuperAdmin) {
      throw httpErrors.BadRequest(
        "Only the person who created this paly list can add music to it"
      );
    }

    const isMusicToPlayList = playList.musics.some(
      (music) => music.toString() == musicId
    );

    if (isMusicToPlayList) {
      throw httpErrors.BadRequest("This music is already in this playlist");
    }

    await playListModel.findByIdAndUpdate(playListId, {
      $addToSet: { musics: musicId },
    });

    res.json({ message: "Added music to play list successfully" });
  } catch (error: any) {
    next(error);
  }
};
export let removeMusic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { musicId } = req.body;
    const { playListId } = req.params;
    const { user } = req as any;

    if (!musicId) {
      throw httpErrors.BadRequest("Music id is required");
    }

    if (!isValidObjectId(musicId)) {
      throw httpErrors.BadRequest("Music id is not from mongodb");
    }

    if (!isValidObjectId(playListId)) {
      throw httpErrors.BadRequest("Play list id is not from mongodb");
    }

    const playList = await playListModel.findById(playListId);

    if (!playList) {
      throw httpErrors.NotFound("Play list not found");
    }

    if (user._id !== playList.createBy && !user.isSuperAdmin) {
      throw httpErrors.BadRequest(
        "Only the person who created this paly list can remove music to it"
      );
    }

    if (!playList.musics.includes(musicId)) {
      throw httpErrors.BadRequest("Music not found in play list");
    }

    await playListModel.findByIdAndUpdate(playListId, {
      $pull: { musics: musicId },
    });

    res.json({ message: "Deleted music from play list successfully" });
  } catch (error: any) {
    next(error);
  }
};
export let searchMusic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { music } = req.query;
    const { playListId } = req.body;
    if (!music) {
      throw httpErrors.BadRequest("Music title is required");
    }

    if (!playListId) {
      throw httpErrors.BadRequest("Playlist id is required");
    }

    if (!isValidObjectId(playListId)) {
      throw httpErrors.BadRequest("Playlist id is not from mongodb");
    }

    const playList = await playListModel.findById(playListId);

    if (!playList) {
      throw httpErrors.BadRequest("Playlist not found");
    }

    const foundMusic = await musicModel.findOne({ title: {$regex: music } }).lean();

    if (!foundMusic) {
      throw httpErrors.BadRequest("Music not found");
    }

    const musicResult = playList.musics.includes(foundMusic._id);

    if (!musicResult) {
      throw httpErrors.BadRequest("The music was not found in the playlist");
    }

    res.json(foundMusic);
  } catch (error) {
    next(error);
  }
};
