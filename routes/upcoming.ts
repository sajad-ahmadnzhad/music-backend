import express from "express";
import authMiddlewares from "../middlewares/auth";
import isBanMiddlewares from "../middlewares/isBan";
import isAdminMiddlewares from "../middlewares/isAdmin";
import validatorMiddlewares from "../middlewares/validator";
import {
  create,
  getAll,
  getByCounty,
  getByGenre,
  getOne,
  myUpcoming,
  related,
  remove,
  search,
  update,
  validation,
} from "../controllers/upcoming";
import imageUploader from "../utils/uploader/profile";
import upcomingValidator from "../validators/upcoming";
const router = express.Router();

router
  .route("/")
  .post(
    authMiddlewares,
    isBanMiddlewares,
    isAdminMiddlewares,
    imageUploader.single("upcomingCover"),
    validatorMiddlewares(upcomingValidator),
    create
  )
  .get(getAll);

router.get(
  "/my-upcoming",
  authMiddlewares,
  isBanMiddlewares,
  isAdminMiddlewares,
  myUpcoming
);

router.post(
  "/validation",
  authMiddlewares,
  isBanMiddlewares,
  isAdminMiddlewares,
  validatorMiddlewares(upcomingValidator),
  validation
);

router.get("/search", search);
router.get("/related/:id", related);
router
  .route("/:id")
  .delete(authMiddlewares, isBanMiddlewares, isAdminMiddlewares, remove)
  .put(
    authMiddlewares,
    isBanMiddlewares,
    isAdminMiddlewares,
    imageUploader.single("upcomingCover"),
    validatorMiddlewares(upcomingValidator),
    update
  )
  .get(getOne);

router.get("/by-country/:countryId", getByCounty);
router.get("/by-genre/:genreId", getByGenre);

export default router;
