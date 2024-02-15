import Joi from "joi";
export default Joi.object({
  name: Joi.string().trim().min(3).max(15).required(),
  username: Joi.string()
    .regex(/^[a-zA-Z0-9_]+$/)
    .message("Username is not valid")
    .trim()
    .min(5)
    .max(20)
    .required(),
  email: Joi.string()
    .trim()
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .message("Email is not valid")
    .email({ tlds: { allow: ["com"] } })
    .required(),
  password: Joi.string().trim().min(8).max(20).required(),
  confirmPassword: Joi.string().trim().valid(Joi.ref("password")).required(),
});
