import joi from "joi";
export default joi.object({
  type: joi.string().trim().valid("music", "album", "singer").required(),
  target_id: joi
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("target id is not from mongodb")
    .required(),
});
