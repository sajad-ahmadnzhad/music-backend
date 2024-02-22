import joi from "joi";
import subcategoryModel from "../models/subcategory";
export default joi.object({
  title: joi
    .string()
    .min(2)
    .max(20)
    .external(async (value, helpers) => {
      const subcategory = await subcategoryModel
        .findOne({ title: value })
        .lean();
      if (subcategory) {
        return helpers.error("This subcategory already exists");
      }
    })
    .required(),
  description: joi.string().min(10).max(50),
});
