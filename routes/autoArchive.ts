import express from "express";
import { getAll } from "../controllers/autoArchive";
import authMiddlewares from "../middlewares/auth";
import isAdminMiddlewares from "../middlewares/isAdmin";
import isSuperAdminMiddlewares from "../middlewares/isSuperAdmin";
const router = express.Router();

router.get("/", getAll);

export default router;
