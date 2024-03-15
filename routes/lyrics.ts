import express from "express";
import isAdminMiddlewares from "../middlewares/isAdmin";
import authMiddlewares from "../middlewares/auth";
import validatorMiddlewares from "../middlewares/validator";
import lyricsValidator from "../validators/lyrics";
import { accept, create, getAll, reject, remove, update } from "../controllers/lyrics";
const router = express.Router();

router
  .route("/")
  .post(authMiddlewares, validatorMiddlewares(lyricsValidator), create)
  .get(authMiddlewares, getAll);

router
  .route("/:id")
  .delete(authMiddlewares, remove)
  .put(authMiddlewares, validatorMiddlewares(lyricsValidator), update);

router.put("/:id/accept", authMiddlewares, isAdminMiddlewares, accept);
router.put("/:id/reject", authMiddlewares, isAdminMiddlewares, reject);

export default router;
