import express from "express";
import {
  create,
  createParent,
  getAll,
  getAllParent,
  remove,
  removeParent,
  update,
  updateParent,
} from "../controllers/category";
import authMiddlewares from "../middlewares/auth";
import isAdminMiddlewares from "../middlewares/isAdmin";
import categoryParentValidator from "../validators/categoryParent";
import categoryValidator from "../validators/category";
import validatorMiddlewares from "../middlewares/validator";
const router = express.Router();
//router category parent
router
  .route("/parent")
  .post(
    authMiddlewares,
    isAdminMiddlewares,
    validatorMiddlewares(categoryParentValidator),
    createParent
  )
  .get(getAllParent);

router
  .route("/parent/:parentId")
  .delete(authMiddlewares, isAdminMiddlewares, removeParent)
  .put(authMiddlewares, isAdminMiddlewares, updateParent);

//router category

router
  .route("/")
  .post(
    authMiddlewares,
    isAdminMiddlewares,
    validatorMiddlewares(categoryValidator),
    create
  )
  .get(getAll);

router
  .route("/:id")
  .delete(authMiddlewares, isAdminMiddlewares, remove)
  .put(authMiddlewares, isAdminMiddlewares, update);


export default router;
