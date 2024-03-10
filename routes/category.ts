import express from "express";
import { create, getAll, update } from "../controllers/category";
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

router.put(
  "/:id",
  authMiddlewares,
  isAdminMiddlewares,
  categoryUploader.single("categoryImage"),
  validatorMiddleware(categoryValidator),
  update
);

export default router;
