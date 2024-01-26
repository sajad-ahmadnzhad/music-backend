import express from "express";
import { create } from "../controllers/userFavorite";
import authMiddlewares from "../middlewares/auth";
import validatorMiddlewares from "../middlewares/validator";
import userFavoriteValidator from "../validators/userFavorite";
const router = express.Router();

router
  .route("/")
  .post(authMiddlewares, validatorMiddlewares(userFavoriteValidator), create);

export default router;
