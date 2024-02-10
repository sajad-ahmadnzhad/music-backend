import joi from "joi";
export default joi.object({
  body: joi.string().trim().min(3).max(2000).required(),
});
