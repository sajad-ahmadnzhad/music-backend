import express from "express";
import authMiddlewares from "../middlewares/auth";
import isAdminMiddlewares from "../middlewares/isAdmin";
import validatorMiddlewares from "../middlewares/validator";
import { create, getAll, getOne, remove, search, update } from "../controllers/upcoming";
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
  )
  .get(getAll);

router.get('/search' , search)

router
  .route("/:id")
  .delete(authMiddlewares, isAdminMiddlewares, remove)
  .put(
    authMiddlewares,
    isAdminMiddlewares,
    imageUploader.single("upcomingCover"),
    validatorMiddlewares(upcomingValidator),
    update
  ).get(getOne);

export default router;
