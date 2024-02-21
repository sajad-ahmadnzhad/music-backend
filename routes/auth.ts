import express from "express";
import {
  login,
  logout,
  register,
  forgotPassword,
  resetPassword,
  verifyEmail,
} from "../controllers/auth";
import validatorMiddlewares from "../middlewares/validator";
import registerValidatorSchema from "../validators/register";
import loginValidatorSchema from "../validators/login";
import profileUploader from "../utils/uploader/profile";
import authMiddlewares from "../middlewares/auth";
const router = express.Router();

router.post("/login", validatorMiddlewares(loginValidatorSchema), login);
router.post(
  "/register",
  profileUploader.single("profile"),
  validatorMiddlewares(registerValidatorSchema),
  register
);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/:id/verify/:token", verifyEmail);
router.post("/logout", authMiddlewares, logout);
export default router;
