import joi from 'joi';
const schema = joi.object({
    title: joi.string().min(2).max(40).required(),
    parent: joi.string(),
    description: joi.string().min(10).max(100)
})

export default schema