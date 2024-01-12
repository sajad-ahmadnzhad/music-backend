import authRouter from './auth'
import usersRouter from './users';
import express from 'express';
const mainRouter = express.Router()

mainRouter.use('/v1/auth' , authRouter)
mainRouter.use('/v1/users' , usersRouter)


export default mainRouter