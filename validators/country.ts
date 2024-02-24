import joi from "joi";
import countryModel from "../models/country";
export default joi.object({
  title: joi
    .string()
    .min(2)
    .max(40)
    .required()
    .external(async (value, helpers) => {
      if (value) {
        const country = await countryModel.findOne({ title: value });
        if (country) return helpers.error("This country already exists");
      }
    }),
  description: joi.string().min(10).max(100),
});
