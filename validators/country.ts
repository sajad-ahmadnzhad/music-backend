import joi from "joi";
export default joi.object({
  title: joi
    .string()
    .trim()
    .min(2)
    .max(40)
    .required(),
  description: joi.string().min(10).max(100),
});
