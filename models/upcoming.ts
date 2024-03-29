import { Schema, model } from "mongoose";
import path from "path";
import { rimrafSync } from "rimraf";
import autoArchiveModel from "./autoArchive";
import commentModel from "./comment";
import categoryModel from "./category";
import serverNotificationModel from "./serverNotification";
import userFavoriteModel from "./userFavorite";
const schema = new Schema(
  {
    title: { type: String, trim: true, required: true },
    artist: { type: Schema.ObjectId, ref: "singer", required: true },
    release_date: { type: Number },
    genre: { type: Schema.ObjectId, ref: "genre", required: true },
    description: { type: String, trim: true },
    cover_image: { type: String },
    country: { type: Schema.ObjectId, ref: "country", required: true },
    createBy: { type: Schema.ObjectId, ref: "users", required: true },
  },
  { timestamps: true }
);

schema.pre("deleteMany", async function (next) {
  try {
    const deletedUpcoming = await this.model.find(this.getFilter());
    const upcomingIds = deletedUpcoming.map((upcoming) => upcoming._id);
    const publicFolder = path.join(process.cwd(), "public");
    const upcomingFiles = deletedUpcoming.map(
      (upcoming) => `${publicFolder}${upcoming.cover_image}`
    );

    rimrafSync(upcomingFiles);

    await commentModel.deleteMany({ target_id: { $in: upcomingIds } });
    await categoryModel.updateMany({
      $pull: { target_ids: { $in: upcomingIds } },
    });
    await serverNotificationModel.deleteMany({
      target_id: { $in: upcomingIds },
      type: "upcoming",
    });

    next();
  } catch (error: any) {
    next(error);
  }
});
schema.pre("deleteOne", async function (next) {
  try {
    const deletedUpcoming = await this.model.findOne(this.getFilter());
    if (!deletedUpcoming) return next();
    const publicFolder = path.join(process.cwd(), "public");

    rimrafSync(`${publicFolder}${deletedUpcoming.cover_image}`);

    await commentModel.deleteMany({ target_id: deletedUpcoming._id });
    await categoryModel.updateMany({
      $pull: { target_ids: deletedUpcoming._id },
    });
    await serverNotificationModel.deleteMany({
      target_id: deletedUpcoming._id,
      type: "upcoming",
    });

    next();
  } catch (error: any) {
    next(error);
  }
});
schema.pre("save", async function (next) {
  try {
    const upcoming = (await this.populate("artist", "country")) as any;

    const existingAutoArchive = await autoArchiveModel.findOne({
      type: "upcoming",
      country: upcoming.artist.country,
    });

    if (existingAutoArchive) {
      await autoArchiveModel.findOneAndUpdate(existingAutoArchive._id, {
        $push: { target_ids: this._id },
      });
    } else {
      await autoArchiveModel.create({
        type: "upcoming",
        country: upcoming.artist.country,
        target_ids: this._id,
      });
    }

    const usersFavorite = await userFavoriteModel.find({
      type: "singer",
      target_id: this.artist,
    });

    const sendServerNotification = usersFavorite.map((item) => {
      return serverNotificationModel.create({
        type: "upcoming",
        receiver: item.user,
        target_id: this._id,
        message: "New music from your favorite artist is coming soon!",
      });
    });

    await Promise.all(sendServerNotification);

    next();
  } catch (error: any) {
    next(error);
  }
});

export default model("upcoming", schema);
