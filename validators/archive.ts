import joi from "joi";
import singerModel from "../models/singer";
import albumModel from "../models/album";
import categoryModel from "../models/category";
export default joi.object({
  title: joi.string().max(50).min(5).required(),
  description: joi.string().max(400).min(10),
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
