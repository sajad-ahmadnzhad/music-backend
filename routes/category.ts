import express from "express";
import {
  create,
  getAll,
  getAllParents,
  remove,
  search,
  update,
} from "../controllers/category";
import authMiddlewares from "../middlewares/auth";
import isAdminMiddlewares from "../middlewares/isAdmin";
import categoryValidator from "../validators/category";
import isBanMiddlewares from "../middlewares/isBan";
import validatorMiddlewares from "../middlewares/validator";
const router = express.Router();

router
  .route("/")
  .post(
    authMiddlewares,
    isBanMiddlewares,
    isAdminMiddlewares,
    validatorMiddlewares(categoryValidator),
    create
  )
  .get(getAll);

router.get("/parent", getAllParents);

router
  .route("/:id")
  .delete(authMiddlewares, isBanMiddlewares, isAdminMiddlewares, remove)
  .put(
    authMiddlewares,
    isBanMiddlewares,
    isAdminMiddlewares,
    validatorMiddlewares(categoryValidator),
    update
  );

router.get("/search", search);

export default router;
