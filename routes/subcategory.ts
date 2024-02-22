import express from "express";
import authMiddlewares from "../middlewares/auth";
import isAdminMiddlewares from "../middlewares/auth";
import validatorMiddlewares from "../middlewares/validator";
import subCategoryValidator from "../validators/subcategory";
import {
  create,
  getAll,
  getOne,
  update,
  remove,
} from "../controllers/subcategory";
const router = express.Router();
router.use(authMiddlewares, isAdminMiddlewares);
router
  .route("/")
  .post(validatorMiddlewares(subCategoryValidator), create)
  .get(getAll);

router
  .route("/:id")
  .get(getOne)
  .put(validatorMiddlewares(subCategoryValidator), update)
  .delete(remove);

export default router;
