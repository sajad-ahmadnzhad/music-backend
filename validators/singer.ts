import Joi from "joi";
import genreModel from "../models/genre";
import singerModel from "../models/singer";
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
  nationality: Joi.string().min(3).max(15).required(),
});
