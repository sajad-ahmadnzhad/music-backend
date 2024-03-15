import express from "express";
import { create, getAll, unread } from "../controllers/notification";
import authMiddlewares from "../middlewares/auth";
import isAdminMiddlewares from "../middlewares/isAdmin";
import validatorMiddlewares from "../middlewares/validator";
import isBanMiddlewares from "../middlewares/isBan";
import notificationValidator from "../validators/notification";
const router = express.Router();
router.use(authMiddlewares, isBanMiddlewares);
router
  .route("/")
  .post(isAdminMiddlewares, validatorMiddlewares(notificationValidator), create)
  .get(getAll);

router.get("/unread", unread);

export default router;
