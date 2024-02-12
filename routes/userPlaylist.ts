import express from "express";
import authMiddlewares from "../middlewares/auth";
import {
  create,
  getAll,
  update,
  remove,
  getOne,
  search,
  addMusic
} from "../controllers/userPlaylist";
import userPlaylistValidator from "../validators/userPlaylist";
import validatorMiddlewares from "../middlewares/validator";
import userPlaylistUploader from "../utils/uploader/profile";
const router = express.Router();

router
  .route("/")
  .post(
    authMiddlewares,
    userPlaylistUploader.single("userPlaylistCover"),
    validatorMiddlewares(userPlaylistValidator),
    create
  )
  .get(authMiddlewares, getAll);

router.get("/search/", authMiddlewares, search);
router.post('/:playlistId/music/:musicId' ,authMiddlewares, addMusic)
router
  .route("/:id")
  .put(
    authMiddlewares,
    userPlaylistUploader.single("userPlaylistCover"),
    validatorMiddlewares(userPlaylistValidator),
    update
  )
  .delete(authMiddlewares, remove)
  .get(authMiddlewares, getOne);

export default router;
