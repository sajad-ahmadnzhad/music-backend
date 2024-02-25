import joi from "joi";
import singerModel from "../models/singer";
import genreModel from "../models/genre";
import countryModel from "../models/country";
export default joi.object({
  title: joi.string().trim().max(50).min(5).required(),
  artist: joi
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("Artist id is not from mongodb")
    .required()
    .external(async (value, helpers) => {
      const singer = await singerModel.findOne({ _id: value });
      if (!singer) return helpers.error("Artist not found");
    }),
  release_date: joi
    .number()
    .integer()
    .min(new Date().getFullYear())
    .max(new Date().getFullYear() + 1),
  genre: joi
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("Genre id is not from mongodb")
    .required()
    .external(async (value, helpers) => {
      const genre = await genreModel.findOne({ _id: value });
      if (!genre) return helpers.error("Genre not found");
    }),
  country: joi
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("Genre id is not from mongodb")
    .required()
    .external(async (value, helpers) => {
      const country = await countryModel.findOne({ _id: value });
      if (!country) return helpers.error("Country not found");
    }),
  description: joi.string().trim().max(400).min(10),
});
