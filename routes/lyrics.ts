import express from "express";
import isAdminMiddlewares from "../middlewares/isAdmin";
import authMiddlewares from "../middlewares/auth";
import validatorMiddlewares from "../middlewares/validator";
import lyricsValidator from "../validators/lyrics";
import { create, getAll, remove } from "../controllers/lyrics";
const router = express.Router();

router
  .route("/")
  .post(authMiddlewares, validatorMiddlewares(lyricsValidator), create)
    .get(authMiddlewares, getAll);
  
    router.route('/:id').delete(authMiddlewares , remove)

export default router;
