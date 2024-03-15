import express from "express";
import {
  create,
  getAll,
  getRead,
  getUnread,
  remove,
} from "../controllers/notification";
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

router.get("/unread", getUnread);
router.get("/read", getRead);
router.route("/:id").delete(isAdminMiddlewares, remove);

export default router;
