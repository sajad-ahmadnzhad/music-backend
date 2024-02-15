import express from "express";
import { create, getAll, getOne, remove } from "../controllers/userFavorite";
import authMiddlewares from "../middlewares/auth";
import isBanMiddlewares from "../middlewares/isBan";
import validatorMiddlewares from "../middlewares/validator";
import userFavoriteValidator from "../validators/userFavorite";
const router = express.Router();

router
  .route("/")
  .post(authMiddlewares,isBanMiddlewares, validatorMiddlewares(userFavoriteValidator), create)
  .get(authMiddlewares,isBanMiddlewares, getAll);

router
  .route("/:id")
  .delete(authMiddlewares,isBanMiddlewares, remove)
  .get(authMiddlewares,isBanMiddlewares, getOne);

export default router;
