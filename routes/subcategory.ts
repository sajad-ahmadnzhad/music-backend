import express from "express";
import authMiddlewares from "../middlewares/auth";
import isAdminMiddlewares from "../middlewares/auth";
import validatorMiddlewares from "../middlewares/validator";
import subCategoryValidator from "../validators/subcategory";
import { create } from "../controllers/subcategory";
const router = express.Router();

router.post(
  "/",
  authMiddlewares,
  isAdminMiddlewares,
  validatorMiddlewares(subCategoryValidator),
  create
);

export default router;
