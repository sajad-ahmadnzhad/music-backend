import express from "express";
import { getAll, read } from "../controllers/serverNotification";
import authMiddlewares from "../middlewares/auth";
import isBanMiddlewares from "../middlewares/isBan";
const router = express.Router();
router.use(authMiddlewares, isBanMiddlewares);
router.get("/", getAll);

router.put("/read/:id", read);

export default router;
