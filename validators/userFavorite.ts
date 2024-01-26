import joi from "joi";
import userFavoriteModel from "../models/userFavorite";
export default joi.object({
  type: joi.string().valid("music", "album").required(),
  target_id: joi
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("target id is not from mongodb")
    .required()
    .external(async (value, helpers) => {
      const userFavorite = await userFavoriteModel.findById(value);
      if (userFavorite)
        return helpers.error(
          "This music or album already exists in the database"
        );
    }),
});
