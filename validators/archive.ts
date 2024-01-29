import joi from "joi";
import singerModel from "../models/singer";
import albumModel from "../models/album";
import categoryModel from "../models/category";
export default joi.object({
  title: joi.string().max(50).min(5).required(),
  description: joi.string().max(400).min(10),
  artist: joi
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("Artist id is not from mongodb")
    .external(async (value, helpers) => {
      if (value) {
        const singer = await singerModel.findById(value);
        if (!singer) return helpers.error("Artist not found");
      }
    }),
  album: joi
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("Album id is not from mongodb")
    .external(async (value, helpers) => {
      if (value) {
        const album = await albumModel.findById(value);
        if (!album) return helpers.error("Album not found");
      }
    }),
  genre: joi
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("Genre id is not from mongodb")
    .external(async (value, helpers) => {
      if (value) {
        const category = await categoryModel.findById(value);
        if (!category) return helpers.error("Genre not found");
      }
    }),
});
