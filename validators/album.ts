import joi from "joi";
import singerModel from "../models/singer";

export default joi.object({
  title: joi.string().max(100).min(10).required(),
  description: joi.string().max(400).min(10),
  artist: joi
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message('Artist id is not from mongodb')
    .required()
    .external(async (value, helpers) => {
      const signer = await singerModel.findOne({ _id: value });
      if (!signer)return helpers.error("artist not found");
    }),
});
