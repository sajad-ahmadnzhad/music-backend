import express from "express";
import authMiddlewares from "../middlewares/auth";
import isAdminMiddlewares from "../middlewares/isAdmin";
import { create } from "../controllers/upcoming";
const router = express.Router();

router.route("/").post(authMiddlewares, isAdminMiddlewares, create);

export default router;
