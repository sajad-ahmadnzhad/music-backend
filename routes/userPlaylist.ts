import express from "express";
import authMiddlewares from "../middlewares/auth";
import {
  create,
  getAll,
  update,
  remove,
  getOne,
  search,
  addMusic,
  removeMusic,
} from "../controllers/userPlaylist";
import userPlaylistValidator from "../validators/userPlaylist";
import validatorMiddlewares from "../middlewares/validator";
import isBanMiddlewares from "../middlewares/isBan";
import userPlaylistUploader from "../utils/uploader/profile";
const router = express.Router();
router.use(authMiddlewares, isBanMiddlewares);
router
  .route("/")
  .post(
    userPlaylistUploader.single("userPlaylistCover"),
    validatorMiddlewares(userPlaylistValidator),
    create
  )
  .get(getAll);

router.get("/search/", search);
router.route("/:playlistId/music/:musicId").post(addMusic).delete(removeMusic);
router
  .route("/:id")
  .put(
    userPlaylistUploader.single("userPlaylistCover"),
    validatorMiddlewares(userPlaylistValidator),
    update
  )
  .delete(remove)
  .get(getOne);

export default router;
