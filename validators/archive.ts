import joi from "joi";
import singerModel from "../models/singer";
import albumModel from "../models/album";
import genreModel from "../models/genre";
export default joi.object({
  title: joi.string().trim().max(50).min(5).required(),
  description: joi.string().trim().max(400).min(10),
  genre: joi
    .string().trim()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("Genre id is not from mongodb")
    .external(async (value, helpers) => {
      if (value) {
        const genre = await genreModel.findById(value);
        if (!genre) return helpers.error("Genre not found");
      }
    }),
});
