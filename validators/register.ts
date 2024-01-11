import Joi from "joi";

export default Joi.object({
  name: Joi.string().min(3).max(15).required(),
  username: Joi.string().min(5).max(15).required(),
  email: Joi.string()
    .email({ tlds: { allow: ["com", "yahoo"] } }).required(),
  password: Joi.string().min(8).max(20).required(),
  confirmPassword: Joi.ref("password"),
});
