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
  unlike,
  validation,
  mySingers,
} from "../controllers/singer";
import validatorSinger from "../validators/singer";
import validatorMiddlewares from "../middlewares/validator";
import isAdminMiddlewares from "../middlewares/isAdmin";
import authMiddlewares from "../middlewares/auth";
import isBanMiddlewares from "../middlewares/isBan";
import uploaderImage from "../utils/uploader/profile";
const router = express.Router();

router
  .route("/")
  .get(getAll)
  .post(
    authMiddlewares,
    isBanMiddlewares,
    isAdminMiddlewares,
    uploaderImage.single("photo"),
    validatorMiddlewares(validatorSinger),
    create
  );

router.post(
  "/validation",
  authMiddlewares,
  isBanMiddlewares,
  isAdminMiddlewares,
  validatorMiddlewares(validatorSinger),
  validation
);

router.get(
  "/my-singers",
  authMiddlewares,
  isBanMiddlewares,
  isAdminMiddlewares,
  mySingers
);

router.get("/search", search);
router.get("/popular", popular);
router.put("/:id/like", authMiddlewares, isBanMiddlewares, like);
router.put("/:id/unlike", authMiddlewares, isBanMiddlewares, unlike);
router
  .route("/:id")
  .put(
    uploaderImage.single("photo"),
    authMiddlewares,
    isBanMiddlewares,
    isAdminMiddlewares,
    validatorMiddlewares(validatorSinger),
    update
  )
  .delete(authMiddlewares, isBanMiddlewares, isAdminMiddlewares, remove)
  .get(getOne);

export default router;
