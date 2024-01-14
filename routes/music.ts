import express from 'express';
import { create } from '../controllers/music';
import authMiddlewares from '../middlewares/auth';
import isAdminMiddlewares from '../middlewares/isAdmin';
const router = express.Router()

router.route('/').post(authMiddlewares , isAdminMiddlewares , create)

export default router