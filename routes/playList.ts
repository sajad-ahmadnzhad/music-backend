import express from "express";
import authMiddlewares from "../middlewares/auth";
import isAdminMiddlewares from "../middlewares/isAdmin";
import validatorMiddlewares from "../middlewares/validator";
import playListValidator from "../validators/playList";
import photoUploader from "../utils/uploader/profile";
import {
  create,
  getAll,
  remove,
  update,
  like,
  unlike,
  view,
  addMusic,
  removeMusic,
  search,
  popular,
  getOne,
} from "../controllers/playList";
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

router.post("/like/:id", like);
router.post("/unlike/:id", unlike);
router.post("/view/:id", view);
router.post(
  "/add-music/:playListId",
  authMiddlewares,
  isAdminMiddlewares,
  addMusic
);

router.delete(
  "/remove-music/:playListId",
  authMiddlewares,
  isAdminMiddlewares,
  removeMusic
);

router.get("/search", search);
router.get("/popular", popular);

router
  .route("/:id")
  .put(
    authMiddlewares,
    isAdminMiddlewares,
    photoUploader.single("playListCover"),
    validatorMiddlewares(playListValidator),
    update
  )
  .delete(authMiddlewares, isAdminMiddlewares, remove)
  .get(getOne);

export default router;
