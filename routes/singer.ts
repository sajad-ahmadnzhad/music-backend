import express from "express";
import { create, getAll, remove, search, update } from "../controllers/singer";
import validatorSinger from "../validators/singer";
import validatorMiddlewares from "../middlewares/validator";
import isAdminMiddlewares from "../middlewares/isAdmin";
import authMiddlewares from "../middlewares/auth";
import uploaderImage from "../utils/uploader/profile";
const router = express.Router();

router
  .route("/")
  .get(getAll)
  .post(
    authMiddlewares,
    isAdminMiddlewares,
    uploaderImage.single("photo"),
    validatorMiddlewares(validatorSinger),
    create
  );

router
  .route("/:id")
  .put(
    uploaderImage.single("photo"),
    validatorMiddlewares(validatorSinger),
    update
  )
  .delete(authMiddlewares, isAdminMiddlewares, remove);

router.get("/search", search);

export default router;
