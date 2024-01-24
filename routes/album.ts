import express from "express";
import { create, getAll, remove } from "../controllers/album";
import isAdminMiddleware from "../middlewares/isAdmin";
import authMiddleware from "../middlewares/auth";
import validatorMiddleware from "../middlewares/validator";
import albumValidator from "../validators/album";
import photoUploader from "../utils/uploader/profile";
const router = express.Router();

router
  .route("/")
  .post(
    authMiddleware,
    isAdminMiddleware,
    photoUploader.single("albumPhoto"),
    validatorMiddleware(albumValidator),
    create
  )
  .get(getAll);

router.route("/:id").delete(authMiddleware, isAdminMiddleware, remove);

export default router;
