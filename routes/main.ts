import authRouter from "./auth";
import usersRouter from "./users";
import musicRouter from "./music";
import countryRouter from "./country";
import singerRouter from "./singer";
import upcomingRouter from "./upcoming";
import albumRouter from "./album";
import userFavoriteRouter from "./userFavorite";
import playListRouter from "./playList";
import archiveRouter from "./archive";
import commentRouter from "./comment";
import singerArchiveRouter from "./singerArchive";
import userPlaylistRouter from "./userPlaylist";
import autoArchiveRouter from "./autoArchive";
import categoryRouter from './category'
import genreRouter from "./genre";
import express from "express";
const mainRouter = express.Router();

mainRouter.use("/v1/auth", authRouter);
mainRouter.use("/v1/users", usersRouter);
mainRouter.use("/v1/music", musicRouter);
mainRouter.use("/v1/country", countryRouter);
mainRouter.use("/v1/singer", singerRouter);
mainRouter.use("/v1/album", albumRouter);
mainRouter.use("/v1/upcoming", upcomingRouter);
mainRouter.use("/v1/user-favorite", userFavoriteRouter);
mainRouter.use("/v1/playlist", playListRouter);
mainRouter.use("/v1/archive", archiveRouter);
mainRouter.use("/v1/comment", commentRouter);
mainRouter.use("/v1/singer-archive", singerArchiveRouter);
mainRouter.use("/v1/user-playlist", userPlaylistRouter);
mainRouter.use("/v1/genre", genreRouter);
mainRouter.use("/v1/auto-archive", autoArchiveRouter);
mainRouter.use("/v1/category", categoryRouter);

export default mainRouter;
