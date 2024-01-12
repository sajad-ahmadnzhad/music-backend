import Joi from "joi";

export default Joi.object({
  identifier: Joi.string().trim().required(),
  password: Joi.string().trim().required(),
});
