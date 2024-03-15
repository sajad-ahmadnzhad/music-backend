import express from "express";
import isAdminMiddlewares from "../middlewares/isAdmin";
import authMiddlewares from "../middlewares/auth";
import validatorMiddlewares from "../middlewares/validator";
import isBanMiddlewares from "../middlewares/isBan";
import lyricsValidator from "../validators/lyrics";
import {
  accept,
  create,
  getAll,
  reject,
  remove,
  unaccepted,
  update,
} from "../controllers/lyrics";
const router = express.Router();
router.use(authMiddlewares, isBanMiddlewares);
router
  .route("/")
  .post(validatorMiddlewares(lyricsValidator), create)
  .get(getAll);

router.get("/unaccepted", isAdminMiddlewares, unaccepted);
router
  .route("/:id")
  .delete(remove)
  .put(validatorMiddlewares(lyricsValidator), update);

router.put("/:id/accept", isAdminMiddlewares, accept);
router.put("/:id/reject", isAdminMiddlewares, reject);

export default router;
