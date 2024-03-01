import joi from "joi";
import genreModel from "../models/genre";
import countryModel from "../models/country";
export default joi.object({
  title: joi.string().trim().max(50).min(5).required(),
  description: joi.string().trim().max(400).min(10),
  genre: joi
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("Genre id is not from mongodb")
    .external(async (value, helpers) => {
      if (value) {
        const genre = await genreModel.findById(value);
        if (!genre) return helpers.error("Genre not found");
      }
    }),
  country: joi
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("Country id is not from mongodb")
    .required()
    .external(async (value, helpers) => {
      if (value) {
        const country = await countryModel.findById(value);
        if (!country) return helpers.error("Country not found");
      }
    }),
});
