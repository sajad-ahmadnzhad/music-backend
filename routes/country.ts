import express from "express";
import { create, getAll } from "../controllers/country";
import authMiddlewares from "../middlewares/auth";
import isAdminMiddlewares from "../middlewares/isAdmin";
import countryValidator from "../validators/country";
import isBanMiddlewares from "../middlewares/isBan";
import validatorMiddlewares from "../middlewares/validator";
import uploader from "../utils/uploader/profile";
const router = express.Router();

router
  .route("/")
  .post(
    authMiddlewares,
    isBanMiddlewares,
    isAdminMiddlewares,
    uploader.single("countryImage"),
    validatorMiddlewares(countryValidator),
    create
  )
  .get(getAll);

export default router;
