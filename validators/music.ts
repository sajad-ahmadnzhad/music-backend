import joi from "joi";
import singerModel from "../models/singer";
import categoryModel from "../models/category";

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
      const genre = await categoryModel.findOne({ _id: value });
      if (!genre) return helpers.error("genre not found");
    }),
  release_year: joi.number().integer().min(2000).max(new Date().getFullYear()),
  description: joi.string().trim(),
  lyrics: joi.string().trim().max(400).min(30),
});
