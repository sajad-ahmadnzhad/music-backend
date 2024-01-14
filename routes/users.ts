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
} from "../controllers/users";
import authMiddlewares from "../middlewares/auth";
import isAdminMiddlewares from "../middlewares/isAdmin";
import isSuperAdminMiddlewares from "../middlewares/isSuperAdmin";
import validatorMiddlewares from "../middlewares/validator";
import registerValidatorSchema from "../validators/register";
import profileUploader from "../utils/uploader/profile";

const router = express.Router();

router
  .route("/")
  .get(authMiddlewares, isAdminMiddlewares, getAll)
  .put(
    authMiddlewares,
    profileUploader.single("profile"),
    validatorMiddlewares(registerValidatorSchema),
    update
  );
router
  .route("/:id/role")
  .put(authMiddlewares, isSuperAdminMiddlewares, changeRole);
router.post("/:id/ban", authMiddlewares, isAdminMiddlewares, ban);
router.put("/:id/unban", authMiddlewares, isAdminMiddlewares, unban);
router.get("/ban", authMiddlewares, isAdminMiddlewares, getAllBan);
router.get("/admin", authMiddlewares, isAdminMiddlewares, getAllAdmin);
router.get("/my-account", authMiddlewares, myAccount);
router.route("/:id").delete(authMiddlewares, isAdminMiddlewares, remove);
export default router;
