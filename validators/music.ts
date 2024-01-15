import joi from "joi";

export default joi.object({
  title: joi.string().max(100).min(5).required(),
  artist: joi.string().max(25).min(3).required(),
  genre: joi.string().max(30).max(3).required(),
  duration: joi
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .message(
      "This type of time is wrong. Enter a correct time, for example: 02:20 or 3:09"
    )
    .required(),
  release_year: joi
    .number()
    .integer()
    .min(2000)
    .max(new Date().getFullYear())
    .required(),
  description: joi.string(),
});
