import joi from "joi";
import usersModel from "../models/users";
export default joi.object({
  title: joi.string().max(20).required(),
  message: joi.string().max(300).required(),
  type: joi
    .string()
    .valid(
      "music",
      "playList",
      "album",
      "users",
      "upcoming",
      "category",
      "other"
    ),
  receiver: joi
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("This receiver id is not from mongodb")
    .required()
    .external(async (value, helpers) => {
      const user = await usersModel.findById(value);
      if (!user) return helpers.error("User not found");
    }),
});
