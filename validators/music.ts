import joi from "joi";
import singerModel from "../models/singer";
import albumModel from "../models/album";
import categoryModel from "../models/category";

export default joi.object({
  title: joi.string().max(100).min(5).required(),
  artist: joi
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("This artist id is not from mongodb")
    .required()
    .external(async (value , helpers) => {
      const artist = await singerModel.findOne({ _id: value });
      if (!artist) return helpers.error("artist not found");
    }),
  genre: joi
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("This genre id is not from mongodb")
    .required()
    .external(async (value , helpers) => {
      const genre = await categoryModel.findOne({ _id: value });
      if (!genre) return helpers.error("genre not found");
    }),
  duration: joi
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .message(
      "This type of time is wrong. Enter a correct time, for example: 02:20 or 3:09"
    )
    .required(),
  release_year: joi
    .number()
    .integer()
    .min(2000)
    .max(new Date().getFullYear())
    .required(),
  description: joi.string(),
  lyrics: joi.string().max(400).min(30),
});
