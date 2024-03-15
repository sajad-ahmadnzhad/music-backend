import express from "express";
import { create, getAll } from "../controllers/notification";
import authMiddlewares from "../middlewares/auth";
import isAdminMiddlewares from "../middlewares/isAdmin";
import validatorMiddlewares from "../middlewares/validator";
import notificationValidator from "../validators/notification";
const router = express.Router();

router
  .route("/")
  .post(
    authMiddlewares,
    isAdminMiddlewares,
    validatorMiddlewares(notificationValidator),
    create
  )
  .get(authMiddlewares, getAll);

export default router;
