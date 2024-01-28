import authRouter from "./auth";
import usersRouter from "./users";
import musicRouter from "./music";
import categoryRouter from "./category";
import singerRouter from "./singer";
import upcomingRouter from "./upcoming";
import albumRouter from "./album";
import userFavoriteRouter from "./userFavorite";
import playListRouter from "./playList";
import criticismRouter from "./criticism";
import express from "express";
const mainRouter = express.Router();

mainRouter.use("/v1/auth", authRouter);
mainRouter.use("/v1/users", usersRouter);
mainRouter.use("/v1/music", musicRouter);
mainRouter.use("/v1/category", categoryRouter);
mainRouter.use("/v1/singer", singerRouter);
mainRouter.use("/v1/album", albumRouter);
mainRouter.use("/v1/upcoming", upcomingRouter);
mainRouter.use("/v1/user-favorite", userFavoriteRouter);
mainRouter.use("/v1/playlist", playListRouter);
mainRouter.use("/v1/criticism", criticismRouter);

export default mainRouter;
