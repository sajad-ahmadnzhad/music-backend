import express from "express";
import authMiddlewares from "../middlewares/auth";
import isAdminMiddlewares from "../middlewares/isAdmin";
import validatorMiddlewares from "../middlewares/validator";
import { create } from "../controllers/upcoming";
import imageUploader from "../utils/uploader/profile";
import upcomingValidator from "../validators/upcoming";
const router = express.Router();

router
  .route("/")
  .post(
    authMiddlewares,
    isAdminMiddlewares,
    imageUploader.single("upcomingCover"),
    validatorMiddlewares(upcomingValidator),
    create
  );

export default router;
