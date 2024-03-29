import { Schema, model } from "mongoose";
import userPlaylistModel from "./userPlaylist";
import userFavoriteModel from "./userFavorite";
import commentModel from "./comment";
import musicModel from "./music";
import singerModel from "./singer";
import albumModel from "./album";
import upcomingModel from "./upcoming";
import genreModel from "./genre";
import countryModel from "./country";
import archiveModel from "./archive";
import playListModel from "./playList";
import { rimrafSync } from "rimraf";
import categoryModel from "./category";
import notificationModel from "./notification";
import lyricsModel from "./lyrics";
import serverNotificationModel from "./serverNotification";
import path from "path";
const schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, require: true, trim: true },
    email: { type: String, trim: true, required: true },
    password: { type: String, required: true, trim: true },
    isAdmin: { type: Boolean, default: false },
    isSuperAdmin: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    profile: { type: String, required: true },
  },
  { timestamps: true }
);

schema.pre("deleteOne", async function (next) {
  try {
    const deletedUser = await this.model.findOne(this.getFilter());
    if (!deletedUser) return next();
    const publicFolder = path.join(process.cwd(), "public");
    if (!deletedUser.profile.includes("customProfile")) {
      rimrafSync(`${publicFolder}${deletedUser.profile}`);
    }

    if (deletedUser.isAdmin) {
      await albumModel.deleteMany({ createBy: deletedUser._id });
      await singerModel.deleteMany({ createBy: deletedUser._id });
      await playListModel.deleteMany({ createBy: deletedUser._id });
      await upcomingModel.deleteMany({ createBy: deletedUser._id });
      await archiveModel.deleteMany({ createBy: deletedUser._id });
      await countryModel.deleteMany({ createBy: deletedUser._id });
      await genreModel.deleteMany({ createBy: deletedUser._id });
      await musicModel.deleteMany({ createBy: deletedUser._id });
      await categoryModel.deleteMany({ createBy: deletedUser._id });
    }

    await userFavoriteModel.deleteMany({ user: deletedUser._id });
    await userPlaylistModel.deleteMany({ createBy: deletedUser._id });
    await notificationModel.deleteMany({
      $or: [{ creator: deletedUser._id }, { receiver: deletedUser._id }],
    });
    await serverNotificationModel.deleteMany({
      $or: [{ receiver: deletedUser._id }, { target_id: deletedUser._id }],
    });
    await notificationModel.deleteMany({
      $or: [{ creator: deletedUser._id }, { receiver: deletedUser._id }],
    });
    await lyricsModel.deleteMany({
      creator: deletedUser._id,
    });
    const userCommentsId = (
      await commentModel.find({ creator: deletedUser._id })
    ).map((comment) => comment._id);
    await commentModel.deleteMany({ creator: deletedUser._id });
    await commentModel.updateMany({
      $pull: {
        reports: deletedUser._id,
        like: deletedUser._id,
        dislike: deletedUser._id,
        replies: { $in: userCommentsId },
      },
    });

    await commentModel.deleteMany({ parentComment: { $in: userCommentsId } });

    await musicModel.updateMany({
      $pull: {
        likes: deletedUser._id,
      },
    });
    await singerModel.updateMany({
      $pull: {
        likes: deletedUser._id,
      },
    });
    next();
  } catch (error: any) {
    next(error);
  }
});

export default model("users", schema);
