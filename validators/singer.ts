import Joi from "joi";
import genreModel from "../models/genre";
import countryModel from "../models/country";
export default Joi.object({
  fullName: Joi.string().trim().min(5).max(30).required(),
  nickname: Joi.string().trim().min(5).max(30),
  englishName: Joi.string().trim().min(5).max(30).required(),
  musicStyle: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("This music style is not from mongodb")
    .required()
    .external(async (value, helpers) => {
      const genre = await genreModel.findById(value);
      if (!genre) return helpers.error("genre not found");
    }),
  country: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("This country is not from mongodb")
    .required()
    .external(async (value, helpers) => {
      const country = await countryModel.findById(value);
      if (!country) return helpers.error("country not found");
    }),
});
