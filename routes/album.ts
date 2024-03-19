import express from "express";
import {
  create,
  getAll,
  getOne,
  remove,
  search,
  update,
  addMusic,
  removeMusic,
  related,
  validation,
} from "../controllers/album";
import isAdminMiddleware from "../middlewares/isAdmin";
import authMiddleware from "../middlewares/auth";
import isBanMiddlewares from "../middlewares/isBan";
import validatorMiddleware from "../middlewares/validator";
import albumValidator from "../validators/album";
import photoUploader from "../utils/uploader/profile";
const router = express.Router();

router
  .route("/")
  .post(
    authMiddleware,
    isBanMiddlewares,
    isAdminMiddleware,
    photoUploader.single("albumPhoto"),
    validatorMiddleware(albumValidator),
    create
  )
  .get(getAll);

router.post(
  "/validation",
  authMiddleware,
  isBanMiddlewares,
  isAdminMiddleware,
  validatorMiddleware(albumValidator),
  validation
);
router.get("/search", search);
router.get("/:id/related", related);
router.post(
  "/add-music/:albumId",
  authMiddleware,
  isBanMiddlewares,
  isAdminMiddleware,
  addMusic
);
router.delete(
  "/remove-music/:albumId",
  authMiddleware,
  isAdminMiddleware,
  removeMusic
);

router
  .route("/:id")
  .delete(authMiddleware, isBanMiddlewares, isAdminMiddleware, remove)
  .put(
    authMiddleware,
    isBanMiddlewares,
    isAdminMiddleware,
    photoUploader.single("albumPhoto"),
    validatorMiddleware(albumValidator),
    update
  )
  .get(getOne);

export default router;
