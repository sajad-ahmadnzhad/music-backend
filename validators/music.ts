import joi from "joi";

export default joi.object({
  title: joi.string().max(100).min(5).required(),
  artist: joi.string().required(),
  genre: joi.string().required(),
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
  lyrics: joi.string().max(400).min(30),
});
