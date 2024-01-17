import Joi from "joi";

export default Joi.object({
  fullName: Joi.string().trim().min(5).max(30).required(),
  nickname: Joi.string().trim().min(5).max(30),
  englishName: Joi.string().trim().min(5).max(30).required(),
  musicStyle: Joi.string().required(),
});
