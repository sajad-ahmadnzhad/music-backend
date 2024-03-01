import express from "express";
import { create, getAll, update, remove } from "../controllers/archive";
import authMiddlewares from "../middlewares/auth";
import isAdminMiddlewares from "../middlewares/isAdmin";
import validatorMiddlewares from "../middlewares/validator";
import archiveValidator from "../validators/archive";
import isBanMiddlewares from "../middlewares/isBan";
import imageUploader from "../utils/uploader/profile";
const router = express.Router();

router
  .route("/")
  .post(
    authMiddlewares,
    isBanMiddlewares,
    isAdminMiddlewares,
    imageUploader.single("archiveCover"),
    validatorMiddlewares(archiveValidator),
    create
  )
  .get(getAll);

router
  .route("/:id")
  .put(
    authMiddlewares,
    isBanMiddlewares,
    isAdminMiddlewares,
    imageUploader.single("archiveCover"),
    validatorMiddlewares(archiveValidator),
    update
  )
  .delete(authMiddlewares, isBanMiddlewares, isAdminMiddlewares, remove);

export default router;
