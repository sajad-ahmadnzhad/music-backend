import express from "express";
import {
  create,
  getAll,
  like,
  popular,
  remove,
  search,
  update,
  view,
  download,
  getOne,
  getByGenre,
} from "../controllers/music";
import authMiddlewares from "../middlewares/auth";
import isBanMiddlewares from "../middlewares/isBan";
import isAdminMiddlewares from "../middlewares/isAdmin";
import validatorMiddlewares from "../middlewares/validator";
import musicValidator from "./../validators/music";
import musicUploader from "./../utils/uploader/music";
const uploader = musicUploader.fields([
  {
    name: "music",
    maxCount: 1,
  },
  {
    name: "cover",
    maxCount: 1,
  },
]);
const router = express.Router();
router
  .route("/")
  .post(
    authMiddlewares,
    isBanMiddlewares,
    isAdminMiddlewares,
    uploader,
    validatorMiddlewares(musicValidator),
    create
  )
  .get(getAll);

router.get("/search", search);
router.get("/:categoryId/by-genre", getByGenre);
router.get("/popular", popular);
router.put("/:id/like", like);
router.put("/:id/view", view);
router.put("/:id/download", download);

router
  .route("/:id")
  .delete(authMiddlewares, isBanMiddlewares, isAdminMiddlewares, remove)
  .put(
    authMiddlewares,
    isBanMiddlewares,
    isAdminMiddlewares,
    uploader,
    validatorMiddlewares(musicValidator),
    update
  )
  .get(getOne);
export default router;
