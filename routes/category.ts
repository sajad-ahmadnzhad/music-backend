import express from "express";
import { getAll } from "../controllers/category";
import categoryUploader from "../utils/uploader/profile";
import validatorMiddleware from "../middlewares/validator";
import categoryValidator from "../validators/category";
import authMiddlewares from '../middlewares/auth'
import isAdminMiddlewares from '../middlewares/isAdmin'
const router = express.Router();

router.route("/").get(getAll);

export default router;
