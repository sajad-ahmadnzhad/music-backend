import express from "express";
import {
  getAll,
  changeRole,
  ban,
  remove,
  update,
  unban,
  getAllBan,
  getAllAdmin,
  myAccount,
  search,
} from "../controllers/users";
import authMiddlewares from "../middlewares/auth";
import isBanMiddlewares from "../middlewares/isBan";
import isAdminMiddlewares from "../middlewares/isAdmin";
import isSuperAdminMiddlewares from "../middlewares/isSuperAdmin";
import validatorMiddlewares from "../middlewares/validator";
import registerValidatorSchema from "../validators/register";
import profileUploader from "../utils/uploader/profile";

const router = express.Router();
router.use(authMiddlewares, isBanMiddlewares);
router
  .route("/")
  .get(isAdminMiddlewares, getAll)
  .put(
    profileUploader.single("profile"),
    validatorMiddlewares(registerValidatorSchema),
    update
  );
router.route("/:id/role").put(isSuperAdminMiddlewares, changeRole);
router.post("/:id/ban", isAdminMiddlewares, ban);
router.put("/:id/unban", isAdminMiddlewares, unban);
router.get("/ban", isAdminMiddlewares, getAllBan);
router.get("/admin", isAdminMiddlewares, getAllAdmin);
router.get("/my-account", myAccount);
router.route("/:id").delete(isAdminMiddlewares, remove);
router.get("/search", isAdminMiddlewares, search);
export default router;
