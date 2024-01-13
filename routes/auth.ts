import express from "express";
import { login, logout, register } from "../controllers/auth";
import validatorMiddlewares from "../middlewares/validator";
import registerValidatorSchema from "../validators/register";
import loginValidatorSchema from "../validators/login";
import profileUploader from "../utils/profileUploader";
import authMiddlewares from "../middlewares/auth";
const router = express.Router();

router.post("/login", validatorMiddlewares(loginValidatorSchema), login);
router.post(
  "/register",
  profileUploader.single("profile"),
  validatorMiddlewares(registerValidatorSchema),
  register
);
router.post("/logout", authMiddlewares, logout);

export default router;
