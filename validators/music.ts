import joi from "joi";
import singerModel from "../models/singer";
import genreModel from "../models/genre";
import albumModel from "../models/album";

export default joi.object({
  title: joi.string().trim().max(100).min(2).required(),
  artist: joi
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("This artist id is not from mongodb")
    .required()
    .external(async (value, helpers) => {
      const artist = await singerModel.findOne({ _id: value });
      if (!artist) return helpers.error("artist not found");
    }),
  genre: joi
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("This genre id is not from mongodb")
    .required()
    .external(async (value, helpers) => {
      const genre = await genreModel.findOne({ _id: value });
      if (!genre) return helpers.error("genre not found");
    }),
  album: joi
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("This album id is not from mongodb")
    .external(async (value, helpers) => {
      if (value) {
        const album = await albumModel.findOne({ _id: value });
        if (!album) return helpers.error("album not found");
      }
    }),
  release_year: joi.number().integer().min(2000).max(new Date().getFullYear()),
  description: joi.string().trim(),
  lyrics: joi.string().trim().max(400).min(30),
});
