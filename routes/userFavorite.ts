import express from "express";
import { create, getAll, getOne, remove } from "../controllers/userFavorite";
import authMiddlewares from "../middlewares/auth";
import validatorMiddlewares from "../middlewares/validator";
import userFavoriteValidator from "../validators/userFavorite";
const router = express.Router();

router
  .route("/")
  .post(authMiddlewares, validatorMiddlewares(userFavoriteValidator), create)
  .get(authMiddlewares, getAll);

router
  .route("/:id")
  .delete(authMiddlewares, remove)
  .get(authMiddlewares, getOne);

export default router;
