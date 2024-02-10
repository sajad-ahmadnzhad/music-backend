import express from "express";
import authMiddlewares from "../middlewares/auth";
import { create } from "../controllers/userPlaylist";
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
  );

export default router;
