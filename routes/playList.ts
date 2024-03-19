import express from "express";
import authMiddlewares from "../middlewares/auth";
import isAdminMiddlewares from "../middlewares/isAdmin";
import isBanMiddlewares from "../middlewares/isBan";
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
  addMusic,
  removeMusic,
  search,
  popular,
  getOne,
  searchMusic,
  getByCountry,
  related,
  validation,
} from "../controllers/playList";
const router = express.Router();

router
  .route("/")
  .post(
    authMiddlewares,
    isBanMiddlewares,
    isAdminMiddlewares,
    photoUploader.single("playListCover"),
    validatorMiddlewares(playListValidator),
    create
  )
  .get(getAll);

router.post(
  "/validation",
  authMiddlewares,
  isBanMiddlewares,
  isAdminMiddlewares,
  validatorMiddlewares(playListValidator),
  validation
);

router.get("/:id/related", related);
router.post("/like/:id", authMiddlewares, like);
router.post("/unlike/:id", authMiddlewares, unlike);
router.get("/by-country/:countryId", getByCountry);
router.post(
  "/add-music/:playListId",
  authMiddlewares,
  isBanMiddlewares,
  isAdminMiddlewares,
  addMusic
);

router.delete(
  "/remove-music/:playListId",
  authMiddlewares,
  isBanMiddlewares,
  isAdminMiddlewares,
  removeMusic
);

router.get("/search-music", searchMusic);

router.get("/search", search);
router.get("/popular", popular);

router
  .route("/:id")
  .put(
    authMiddlewares,
    isBanMiddlewares,
    isAdminMiddlewares,
    photoUploader.single("playListCover"),
    validatorMiddlewares(playListValidator),
    update
  )
  .delete(authMiddlewares, isBanMiddlewares, isAdminMiddlewares, remove)
  .get(getOne);

export default router;
