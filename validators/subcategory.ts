import joi from "joi";
export default joi.object({
  title: joi
    .string()
    .min(2)
    .max(20)
    .required(),
  description: joi.string().min(10).max(50),
});
