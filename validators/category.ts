import joi from 'joi';
const schema = joi.object({
    title: joi.string().min(3).max(40).required(),
    parent: joi.string().required(),
    description: joi.string().min(10).max(300)
})

export default schema