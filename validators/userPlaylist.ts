import joi from "joi";
import genreModel from "../models/genre";
export default joi.object({
  title: joi.string().trim().min(3).max(50).required(),
  description: joi.string().trim().min(3).max(400),
  genre: joi
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("genre id is not from mongodb")
    .external(async (value, helpers) => {
      if (value) {
        const genre = await genreModel.findById(value).lean();
        if (!genre) return helpers.error("Genre not found");
      }
    }),
});
