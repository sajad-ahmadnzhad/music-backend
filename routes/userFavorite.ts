import express from "express";
import { create, getAll, getOne, remove } from "../controllers/userFavorite";
import authMiddlewares from "../middlewares/auth";
import isBanMiddlewares from "../middlewares/isBan";
import validatorMiddlewares from "../middlewares/validator";
import userFavoriteValidator from "../validators/userFavorite";
const router = express.Router();
router.use(authMiddlewares, isBanMiddlewares);
router
  .route("/")
  .post(validatorMiddlewares(userFavoriteValidator), create)
  .get(getAll);

router.route("/:id").delete(remove).get(getOne);

export default router;
