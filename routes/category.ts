import express from "express";
import { create, getAll } from "../controllers/category";
import categoryUploader from "../utils/uploader/profile";
import validatorMiddleware from "../middlewares/validator";
import categoryValidator from "../validators/category";
import authMiddlewares from "../middlewares/auth";
import isAdminMiddlewares from "../middlewares/isAdmin";
const router = express.Router();

router
  .route("/")
  .post(
    authMiddlewares,
    isAdminMiddlewares,
    categoryUploader.single("categoryImage"),
    validatorMiddleware(categoryValidator),
    create
  )
  .get(getAll);

export default router;
