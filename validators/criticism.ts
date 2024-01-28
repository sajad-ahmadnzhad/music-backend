import joi from "joi";
export default joi.object({
  type: joi.string().valid("music", "singer").required(),
  body: joi.string().max(500).min(5).required(),
  score: joi.number().integer().valid(1, 2, 3, 4, 5).default(5),
  target_id: joi
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required(),
});
