import joi from "joi";
import genreModel from "../models/genre";
import countryModel from "../models/country";
import usersModel from "../models/users";
export default joi.object({
  title: joi.string().min(2).max(40).required(),
  description: joi.string().min(5).max(100),
  type: joi
    .string()
    .valid("music", "album", "playList", "archive", "upcoming", "singer")
    .required(),
  accessLevel: joi
    .string()
    .valid("private", "allAdmins", "selectedCollaborators"),
  genre: joi
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("Genre id is not from mongodb")
    .external(async (value, helpers) => {
      if (value) {
        const genre = await genreModel.findById(value);
        if (!genre) return helpers.error("Genre not found");
      }
    }),
  country: joi
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("Country id is not from mongodb")
    .required()
    .external(async (value, helpers) => {
      const country = await countryModel.findById(value);
      if (!country) return helpers.error("Country not found");
    }),
  collaborators: joi.array().items(
    joi
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .message("id is not from mongodb")
      .required()
      .label("This id is not from mongodb")
      .external(async (value, helpers) => {
        const existingAdmin = await usersModel.findOne({
          _id: value,
          isAdmin: true,
        });
        if (!existingAdmin) return helpers.error("Admin not found");
      })
  ),
});
