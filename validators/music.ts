import joi from "joi";

export default joi.object({
  title: joi.string().max(25).min(5).required(),
  artist: joi.string().max(25).min(3).required(),
  genre: joi.string().max(30).max(3).required(),
  duration: joi.string().length(6).required(),
  release_year: joi
    .number()
    .integer()
    .min(2000)
    .max(new Date().getFullYear())
    .required(),
  description: joi.string(),
});
