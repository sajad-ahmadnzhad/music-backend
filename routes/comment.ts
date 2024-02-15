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
import isBanMiddlewares from "../middlewares/isBan";
import authMiddlewares from "../middlewares/auth";
import isAdminMiddlewares from "../middlewares/isAdmin";
import validatorMiddlewares from "../middlewares/validator";
import commentValidatorSchema from "../validators/comment";
const router = express.Router();

router
  .route("/:musicId")
  .post(
    authMiddlewares,
    isBanMiddlewares,
    validatorMiddlewares(commentValidatorSchema),
    create
  )
  .get(getAll);

router.post(
  "/:commentId/reply/:musicId",
  authMiddlewares,
  isBanMiddlewares,
  reply
);
router.post("/:commentId/like", authMiddlewares, isBanMiddlewares, like);
router.post("/:commentId/unlike", authMiddlewares, isBanMiddlewares, unlike);
router.post("/:commentId/report", authMiddlewares, isBanMiddlewares, report);
router.post(
  "/:commentId/un-report",
  authMiddlewares,
  isBanMiddlewares,
  unReport
);
router.post("/:commentId/dislike", authMiddlewares, isBanMiddlewares, dislike);
router.post(
  "/:commentId/un-dislike",
  authMiddlewares,
  isBanMiddlewares,
  unDislike
);
router.get(
  "/:musicId/reports",
  authMiddlewares,
  isBanMiddlewares,
  isAdminMiddlewares,
  allReports
);
router
  .route("/:commentId/")
  .delete(authMiddlewares, isBanMiddlewares, remove)
  .put(
    authMiddlewares,
    isBanMiddlewares,
    validatorMiddlewares(commentValidatorSchema),
    update
  );
export default router;
