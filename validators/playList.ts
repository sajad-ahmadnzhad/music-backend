import joi from "joi";
import countryModel from "../models/country";
export default joi.object({
  title: joi.string().trim().max(100).min(10).required(),
  description: joi.string().trim().max(400).min(10),
  country: joi
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("country id is not from mongodb")
    .external(async (value, helpers) => {
      if (value) {
        const country = await countryModel.findById(value);
        if (!country) return helpers.error("country not found");
      }
    }),
});
