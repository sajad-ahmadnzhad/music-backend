import express from "express";
import { getAll, getOne } from "../controllers/singerArchive";
const router = express.Router();

router.route("/").get(getAll);
router.route("/:id").get(getOne);

export default router;
