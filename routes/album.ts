import express from "express";
import { create, getAll, getOne, remove, search, update } from "../controllers/album";
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

router.get('/search' , search)

router
  .route("/:id")
  .delete(authMiddleware, isAdminMiddleware, remove)
  .put(
    authMiddleware,
    isAdminMiddleware,
    photoUploader.single("albumPhoto"),
    validatorMiddleware(albumValidator),
    update
  )
  .get(getOne);

export default router;
