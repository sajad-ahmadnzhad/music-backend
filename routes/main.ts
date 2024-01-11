import authRouter from './auth'
import express from 'express';
const mainRouter = express.Router()

mainRouter.use('/v1/auth' , authRouter)


export default mainRouter