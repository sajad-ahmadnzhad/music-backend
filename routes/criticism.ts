import express from "express";
import authMiddlewares from "../middlewares/auth";
import isAdminMiddlewares from "../middlewares/isAdmin";
import validatorMiddlewares from "../middlewares/validator";
import criticismValidator from "../validators/criticism";
import { create } from "../controllers/criticism";
const router = express.Router();

router
  .route("/")
  .post(authMiddlewares, validatorMiddlewares(criticismValidator), create);

export default router;
