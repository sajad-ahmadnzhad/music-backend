import joi from "joi";
import categoryModel from "../models/category";
export default joi.object({
  title: joi.string().trim().max(100).min(10).required(),
  description: joi.string().trim().max(400).min(10),
  category: joi
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("Category id is not from mongodb")
      .external(async(value, helpers) => {
        const category = await categoryModel.findById(value)
        if(!category)return helpers.error('Category not found')
    }),
});
