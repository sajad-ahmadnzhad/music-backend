import joi from "joi";
import categoryModel from "../models/category";
export default joi.object({
  title: joi.string().min(3).max(50).required(),
  description: joi.string().min(3).max(400),
  genre: joi
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("genre id is not from mongodb")
    .external(async (value, helpers) => {
      if (value) {
        const genre = await categoryModel.findById(value).lean();
        if (!genre) return helpers.error("Genre not found");
      }
    }),
});
