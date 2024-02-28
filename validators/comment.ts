import joi from "joi";
import musicModel from "../models/music";
import playListModel from "../models/playList";
import albumModel from "../models/album";
import { Types } from "mongoose";
import upcomingModel from "../models/upcoming";
export default joi
  .object({
    body: joi.string().trim().min(3).max(2000),
    targetId: joi
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .message("target id is not from mongodb")
      .required(),
    type: joi
      .string()
      .trim()
      .valid("music", "playList", "album", "upcoming")
      .required(),
  })
  .external(async (obj, helpers) => {
    const { targetId, type } = obj;
    const errorMessage = await getContent(type, targetId);
    if (typeof errorMessage === "string") return helpers.error(errorMessage);
  });


export async function getContent(
  type: string,
  targetId: Types.ObjectId
): Promise<string | undefined> {
  switch (type) {
    case "music":
      const music = await musicModel.findById(targetId);
      if (!music) return "Music not found";
      break;
    case "album":
      const album = await albumModel.findById(targetId);
      if (!album) return "Album not found";
      break;
    case "playList":
      const playList = await playListModel.findById(targetId);
      if (!playList) return "PlayList not found";
      break;
    case "upcoming":
      const upcoming = await upcomingModel.findById(targetId);
      if (!upcoming) return "Upcoming not found";
      break;
  }
}
