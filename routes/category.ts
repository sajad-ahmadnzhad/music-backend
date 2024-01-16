import express from "express";
import { createParent, getAllParent } from "../controllers/category";
import authMiddlewares from "../middlewares/auth";
import isAdminMiddlewares from "../middlewares/isAdmin";
import isSuperAdminMiddlewares from "../middlewares/isSuperAdmin";
import categoryParentValidator from "../validators/categoryParent";
import validatorMiddlewares from "../middlewares/validator";
const router = express.Router();
router
  .route("/parent")
  .post(
    authMiddlewares,
    isAdminMiddlewares,
    validatorMiddlewares(categoryParentValidator),
    createParent
  )
  .get(getAllParent);

export default router;
