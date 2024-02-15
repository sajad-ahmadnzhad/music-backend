import joi from "joi";
import singerModel from "../models/singer";
import categoryModel from "../models/category";
export default joi.object({
  title: joi.string().max(50).min(5).required(),
  artist: joi
    .string()
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
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("Genre id is not from mongodb")
    .required()
    .external(async (value, helpers) => {
      const genre = await categoryModel.findOne({ _id: value });
      if (!genre) return helpers.error("Genre not found");
    }),
  description: joi.string().max(400).min(10),
});
