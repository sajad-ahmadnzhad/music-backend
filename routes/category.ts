import express from 'express';
import { getAllParent } from '../controllers/category';
const router = express.Router()

router.route('/parent').post().get(getAllParent)

export default router