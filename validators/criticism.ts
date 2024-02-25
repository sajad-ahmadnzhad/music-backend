import joi from "joi";

export default joi.object({
  type: joi.string().trim().valid("music", "singer").required(),
  body: joi.string().trim().max(500).min(5).required(),
  score: joi.number().integer().valid(1, 2, 3, 4, 5).default(5),
  target_id: joi
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("target id is not from mongodb")
    .required(),
});
