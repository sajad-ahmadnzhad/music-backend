import express from "express";
import {
  addToCategory,
  create,
  getAll,
  getOne,
  remove,
  search,
  update,
} from "../controllers/category";
import categoryUploader from "../utils/uploader/profile";
import validatorMiddleware from "../middlewares/validator";
import categoryValidator from "../validators/category";
import authMiddlewares from "../middlewares/auth";
import isAdminMiddlewares from "../middlewares/isAdmin";
const router = express.Router();

router
  .route("/")
  .post(
    authMiddlewares,
    isAdminMiddlewares,
    categoryUploader.single("categoryImage"),
    validatorMiddleware(categoryValidator),
    create
  )
  .get(getAll);

router.get("/search", search);
router.post(
  "/add-to-category/:id",
  authMiddlewares,
  isAdminMiddlewares,
  addToCategory
);
router
  .route("/:id")
  .put(
    authMiddlewares,
    isAdminMiddlewares,
    categoryUploader.single("categoryImage"),
    validatorMiddleware(categoryValidator),
    update
  )
  .delete(authMiddlewares, isAdminMiddlewares, remove)
  .get(getOne);

export default router;
