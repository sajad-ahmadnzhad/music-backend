import Joi from "joi";

export default Joi.object({
  identifier: Joi.string().required(),
  password: Joi.string().required(),
});
