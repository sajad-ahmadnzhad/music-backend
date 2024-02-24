import express from "express";
import authMiddlewares from "../middlewares/auth";
import isAdminMiddlewares from "../middlewares/auth";
import validatorMiddlewares from "../middlewares/validator";
import isBanMiddlewares from "../middlewares/isBan";
import genreValidator from "../validators/genre";
import { create, getAll, getOne, update, remove } from "../controllers/genre";
const router = express.Router();

router
  .route("/")
  .post(
    authMiddlewares,
    isBanMiddlewares,
    isAdminMiddlewares,
    validatorMiddlewares(genreValidator),
    create
  )
  .get(getAll);

router
  .route("/:id")
  .get(getOne)
  .put(
    authMiddlewares,
    isBanMiddlewares,
    isAdminMiddlewares,
    validatorMiddlewares(genreValidator),
    update
  )
  .delete(authMiddlewares, isBanMiddlewares, isAdminMiddlewares, remove);

export default router;
