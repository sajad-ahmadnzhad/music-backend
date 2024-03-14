import joi from "joi";
import musicModel from "../models/music";
export default joi.object({
  text: joi.string().min(10).required(),
  musicId: joi
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("This music id is not from mongodb")
    .required()
    .external(async (value, helpers) => {
      const music = await musicModel.findById(value);
      if (!music) return helpers.error("Music not found");
    }),
});
