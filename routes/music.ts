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
  unlike,
  getByGenre,
  getByCountry,
  getAllSingle,
  related,
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

router.get("/:id/related", related);
router.get("/search", search);
router.get("/single", getAllSingle);
router.get("/by-country/:countryId", getByCountry);
router.get("/popular", popular);
router.put("/:id/like", authMiddlewares, isBanMiddlewares, like);
router.put("/:id/unlike", authMiddlewares, isBanMiddlewares, unlike);
router.put("/:id/view", view);
router.put("/:id/download", download);
router.get("/by-genre/:genreId", getByGenre);
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
