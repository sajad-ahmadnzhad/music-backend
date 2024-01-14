import authRouter from './auth'
import usersRouter from './users';
import musicRouter from './music'
import express from 'express';
const mainRouter = express.Router()

mainRouter.use('/v1/auth' , authRouter)
mainRouter.use('/v1/users' , usersRouter)
mainRouter.use('/v1/music' , musicRouter)

export default mainRouter