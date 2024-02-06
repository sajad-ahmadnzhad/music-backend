import joi from "joi";
import commentModel from "../models/comment";
import musicModel from "../models/music";
export default joi.object({
  body: joi.string().min(3).max(2000).required(),
  mainCommentID: joi
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("Comment id is not from mongodb")
    .optional()
    .external(async (value, helpers) => {
      if (value) {
        const comment = await commentModel.findOne({ _id: value });
        if (!comment) helpers.error("Comment not found");
      }
    }),

  music: joi
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("Music id is not from mongodb")
    .optional()
    .external(async (value, helpers) => {
      if (value) {
        const music = await musicModel.findOne({ _id: value });
        if (!music) helpers.error("Music not found");
      }
    }),
  score: joi.number().valid(1, 2, 3, 4, 5),
});
