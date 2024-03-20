import express from "express";
import {
  create,
  getAll,
  getOne,
  myCountries,
  remove,
  search,
  update,
  validation,
} from "../controllers/country";
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

router.get(
  "/my-countries",
  authMiddlewares,
  isBanMiddlewares,
  isAdminMiddlewares,
  myCountries
);

router.post(
  "/validation",
  authMiddlewares,
  isBanMiddlewares,
  isAdminMiddlewares,
  validatorMiddlewares(countryValidator),
  validation
);

router.get("/search", search);

router
  .route("/:id")
  .put(
    authMiddlewares,
    isBanMiddlewares,
    isAdminMiddlewares,
    uploader.single("countryImage"),
    validatorMiddlewares(countryValidator),
    update
  )
  .delete(authMiddlewares, isBanMiddlewares, isAdminMiddlewares, remove)
  .get(getOne);

export default router;
