import express from "express";
import {
  create,
  getAll,
  popular,
  remove,
  search,
  update,
  getOne,
  like,
} from "../controllers/singer";
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

router.get("/search", search);
router.get("/popular", popular);
router.put("/:id/like", authMiddlewares, like);
router
  .route("/:id")
  .put(
    uploaderImage.single("photo"),
    authMiddlewares,
    isAdminMiddlewares,
    validatorMiddlewares(validatorSinger),
    update
  )
  .delete(authMiddlewares, isAdminMiddlewares, remove)
  .get(getOne);

export default router;
