import express from "express";
import {
  create,
  getAll,
  getAllParents,
  remove,
  update,
} from "../controllers/category";
import authMiddlewares from "../middlewares/auth";
import isAdminMiddlewares from "../middlewares/isAdmin";
import categoryValidator from "../validators/category";
import validatorMiddlewares from "../middlewares/validator";
const router = express.Router();

router
  .route("/")
  .post(
    authMiddlewares,
    isAdminMiddlewares,
    validatorMiddlewares(categoryValidator),
    create
  )
  .get(getAll);

router.get('/parent' , getAllParents)

router
  .route("/:id")
  .delete(authMiddlewares, isAdminMiddlewares, remove)
  .put(
    authMiddlewares,
    isAdminMiddlewares,
    validatorMiddlewares(categoryValidator),
    update
  );


export default router;
