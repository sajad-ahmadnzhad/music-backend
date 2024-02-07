import joi from "joi";
export default joi.object({
  comment: joi.string().min(3).max(2000).required(),
  score: joi.number().valid(1, 2, 3, 4, 5),
});
