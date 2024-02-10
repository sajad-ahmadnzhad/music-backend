import express from "express";
import {
  create,
  getAll,
  reply,
  remove,
  update,
  like,
  unlike,
  report,
  unReport,
  dislike,
  unDislike,
  allReports,
} from "../controllers/comment";
import expressRateLimit from "express-rate-limit";
import authMiddlewares from "../middlewares/auth";
import isAdminMiddlewares from "../middlewares/isAdmin";
import validatorMiddlewares from "../middlewares/validator";
import commentValidatorSchema from "../validators/comment";
const router = express.Router();

router
  .route("/:musicId")
  .post(authMiddlewares, validatorMiddlewares(commentValidatorSchema), create)
  .get(getAll);

router.post("/:commentId/reply/:musicId", authMiddlewares, reply);
router.post("/:commentId/like", authMiddlewares, like);
router.post("/:commentId/unlike", authMiddlewares, unlike);
router.post("/:commentId/report", authMiddlewares, report);
router.post("/:commentId/un-report", authMiddlewares, unReport);
router.post("/:commentId/dislike", authMiddlewares, dislike);
router.post("/:commentId/un-dislike", authMiddlewares, unDislike);
router.get(
  "/:musicId/reports",
  authMiddlewares,
  isAdminMiddlewares,
  allReports
);
router
  .route("/:commentId/")
  .delete(authMiddlewares, remove)
  .put(authMiddlewares, validatorMiddlewares(commentValidatorSchema), update);
export default router;
