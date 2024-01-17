import authRouter from "./auth";
import usersRouter from "./users";
import musicRouter from "./music";
import categoryRouter from "./category";
import singerRouter from "./singer";
import express from "express";
const mainRouter = express.Router();

mainRouter.use("/v1/auth", authRouter);
mainRouter.use("/v1/users", usersRouter);
mainRouter.use("/v1/music", musicRouter);
mainRouter.use("/v1/category", categoryRouter);
mainRouter.use("/v1/singer", singerRouter);

export default mainRouter;
