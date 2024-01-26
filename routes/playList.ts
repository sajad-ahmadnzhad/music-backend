import express from "express";
import authMiddlewares from "../middlewares/auth";
import isAdminMiddlewares from "../middlewares/isAdmin";
import validatorMiddlewares from "../middlewares/validator";
import playListValidator from "../validators/playList";
import photoUploader from "../utils/uploader/profile";
import { create, getAll, update } from "../controllers/playList";
const router = express.Router();

router
  .route("/")
  .post(
    authMiddlewares,
    isAdminMiddlewares,
    photoUploader.single("playListCover"),
    validatorMiddlewares(playListValidator),
    create
  )
  .get(getAll);

router
  .route("/:id")
  .put(
    authMiddlewares,
    isAdminMiddlewares,
    photoUploader.single("playListCover"),
    validatorMiddlewares(playListValidator),
    update
)

export default router;
