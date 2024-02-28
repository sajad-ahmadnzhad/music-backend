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
  reviewed,
} from "../controllers/comment";
import isBanMiddlewares from "../middlewares/isBan";
import authMiddlewares from "../middlewares/auth";
import isAdminMiddlewares from "../middlewares/isAdmin";
import validatorMiddlewares from "../middlewares/validator";
import commentValidatorSchema from "../validators/comment";
const router = express.Router();

router
  .route("/")
  .post(
    authMiddlewares,
    isBanMiddlewares,
    validatorMiddlewares(commentValidatorSchema),
    create
  )
  .get(validatorMiddlewares(commentValidatorSchema), getAll);

router.post(
  "/:commentId/reply",
  authMiddlewares,
  isBanMiddlewares,
  validatorMiddlewares(commentValidatorSchema),
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

router.put(
  "/:commentId/reviewed",
  authMiddlewares,
  isBanMiddlewares,
  isAdminMiddlewares,
  reviewed
);

router.get(
  "/reports",
  authMiddlewares,
  isBanMiddlewares,
  isAdminMiddlewares,
  validatorMiddlewares(commentValidatorSchema),
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
