import express from 'express';
import { create } from '../controllers/music';
import authMiddlewares from '../middlewares/auth';
import isAdminMiddlewares from '../middlewares/isAdmin';
import validatorMiddlewares from '../middlewares/validator';
import musicValidator from './../validators/music'
const router = express.Router()
router.route('/').post(authMiddlewares , isAdminMiddlewares ,validatorMiddlewares(musicValidator), create)

export default router