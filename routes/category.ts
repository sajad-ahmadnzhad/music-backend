import express from "express";
import {
  addToCategory,
  create,
  getAll,
  getOne,
  like,
  related,
  remove,
  removeFromCategory,
  search,
  unlike,
  update,
} from "../controllers/category";
import categoryUploader from "../utils/uploader/profile";
import validatorMiddleware from "../middlewares/validator";
import categoryValidator from "../validators/category";
import authMiddlewares from "../middlewares/auth";
import isAdminMiddlewares from "../middlewares/isAdmin";
import isBanMiddlewares from "../middlewares/isBan";
const router = express.Router();

router
  .route("/")
  .post(
    authMiddlewares,
    isBanMiddlewares,
    isAdminMiddlewares,
    categoryUploader.single("categoryImage"),
    validatorMiddleware(categoryValidator),
    create
  )
  .get(getAll);

router.get("/search", search);
router.put(
  "/add-to-category/:id",
  authMiddlewares,
  isBanMiddlewares,
  isAdminMiddlewares,
  addToCategory
);
router.delete(
  "/remove-from-category/:id",
  authMiddlewares,
  isBanMiddlewares,
  isAdminMiddlewares,
  removeFromCategory
);
router.put("/like/:id", authMiddlewares, isBanMiddlewares, like);
router.put("/unlike/:id", authMiddlewares, isBanMiddlewares, unlike);
router.get('/related/:id' , related)
router
  .route("/:id")
  .put(
    authMiddlewares,
    isBanMiddlewares,
    isAdminMiddlewares,
    categoryUploader.single("categoryImage"),
    validatorMiddleware(categoryValidator),
    update
  )
  .delete(authMiddlewares, isBanMiddlewares, isAdminMiddlewares, remove)
  .get(getOne);

export default router;
