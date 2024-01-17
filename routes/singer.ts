import express from 'express';
import { getAll } from '../controllers/singer'
const router = express.Router()

router.route('/').get(getAll)

export default router