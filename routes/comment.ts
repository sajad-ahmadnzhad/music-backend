import express from "express";
import { create, getAll } from "../controllers/comment";
import authMiddlewares from "../middlewares/auth";
import validatorMiddlewares from "../middlewares/validator";
import commentValidatorSchema from "../validators/comment";
const router = express.Router();

router
  .route("/:musicId")
  .post(authMiddlewares, validatorMiddlewares(commentValidatorSchema), create)
  .get(getAll);

export default router;
