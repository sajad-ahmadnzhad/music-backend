import express from "express";
import { create, getAll } from "../controllers/music";
import authMiddlewares from "../middlewares/auth";
import isAdminMiddlewares from "../middlewares/isAdmin";
import validatorMiddlewares from "../middlewares/validator";
import musicValidator from "./../validators/music";
import musicUploader from "./../utils/uploader/music";
const router = express.Router();
router.route("/").post(
  authMiddlewares,
  isAdminMiddlewares,
  musicUploader.fields([
    {
      name: "music",
      maxCount: 1,
    },
    {
      name: "cover",
      maxCount: 1,
    },
  ]),
  validatorMiddlewares(musicValidator),
  create
);

router.get("/", getAll);

export default router;
