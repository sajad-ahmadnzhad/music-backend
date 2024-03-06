import express from "express";
import { getAll , getOne } from "../controllers/autoArchive";
import authMiddlewares from "../middlewares/auth";
import isAdminMiddlewares from "../middlewares/isAdmin";
import isSuperAdminMiddlewares from "../middlewares/isSuperAdmin";
const router = express.Router();

router.get("/", getAll);
router.get("/:id", getOne);

export default router;
