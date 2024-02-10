import express from 'express'
import {getAll} from '../controllers/singerArchive'
const router = express.Router()

router.route('/').get(getAll)

export default router