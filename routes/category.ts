import express from "express";
import {
  addToCategory,
  create,
  getAll,
  getByCountry,
  getOne,
  leaveCategory,
  like,
  myCategories,
  popular,
  related,
  remove,
  removeFromCategory,
  search,
  unlike,
  update,
  validation,
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

router.get(
  "/my-categories",
  authMiddlewares,
  isBanMiddlewares,
  isAdminMiddlewares,
  myCategories
);

router.post(
  "/validation",
  authMiddlewares,
  isBanMiddlewares,
  isAdminMiddlewares,
  validatorMiddleware(categoryValidator),
  validation
);

router.get("/search", search);
router.put(
  "/leave-category/:id",
  authMiddlewares,
  isAdminMiddlewares,
  leaveCategory
);
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
router.get("/popular", popular);
router.get("/related/:id", related);
router.get("/by-country/:countryId", getByCountry);
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
