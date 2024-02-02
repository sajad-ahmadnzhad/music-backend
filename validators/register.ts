import Joi from "joi";

export default Joi.object({
  name: Joi.string().trim().min(3).max(15).required(),
  username: Joi.string().trim().min(5).max(15).required(),
  email: Joi.string().trim()
    .email({ tlds: { allow: ["com", "yahoo"] } }).required(),
  password: Joi.string().trim().min(8).max(20).required(),
  confirmPassword: Joi.string().trim().valid(Joi.ref("password")).required(),
});
