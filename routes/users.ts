import express from "express";
import {
  getAll,
  changeRole,
  ban,
  remove,
  update,
  unban,
  getAllBan,
} from "../controllers/users";
import authMiddlewares from "../middlewares/auth";
import isAdminMiddlewares from "../middlewares/isAdmin";
import isSuperAdminMiddlewares from "../middlewares/isSuperAdmin";
import validatorMiddlewares from "../middlewares/validator";
import registerValidatorSchema from "../validators/register";

const router = express.Router();

router
  .route("/")
  .get(authMiddlewares, isAdminMiddlewares, getAll)
  .put(authMiddlewares, validatorMiddlewares(registerValidatorSchema), update);
router
  .route("/:id/role")
  .put(authMiddlewares, isSuperAdminMiddlewares, changeRole);
router.post("/:id/ban", authMiddlewares, isAdminMiddlewares, ban);
router.put("/:id/unban", authMiddlewares, isAdminMiddlewares, unban);
router.get("/ban", authMiddlewares, isAdminMiddlewares, getAllBan);
router.route("/:id").delete(authMiddlewares, isAdminMiddlewares, remove);
export default router;
