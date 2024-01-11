import express from "express";
import { login, logout, register } from "../controllers/auth";
import validatorMiddlewares from "../middlewares/validator";
import registerValidatorSchema from "../validators/register";
import loginValidatorSchema from "../validators/login";
const router = express.Router();

router.post("/login",validatorMiddlewares(loginValidatorSchema), login); 
router.post("/register",validatorMiddlewares(registerValidatorSchema), register);
router.post("/logout", logout);

export default router;
