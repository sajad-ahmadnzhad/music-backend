import express from "express";
import { create } from "../controllers/music";
import authMiddlewares from "../middlewares/auth";
import isAdminMiddlewares from "../middlewares/isAdmin";
import validatorMiddlewares from "../middlewares/validator";
import musicValidator from "./../validators/music";
import musicUploader from "./../utils/uploader/music";
const router = express.Router();
router
  .route("/")
  .post(
    authMiddlewares,
      isAdminMiddlewares,
      musicUploader.single('music'),
    validatorMiddlewares(musicValidator),
    create
  );

export default router;
