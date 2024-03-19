import { Schema, model } from "mongoose";
import autoArchiveModel from "../models/autoArchive";
import commentModel from "./comment";
import path from "path";
import { rimrafSync } from "rimraf";
import categoryModel from "./category";
import serverNotificationModel from "./serverNotification";
const schema = new Schema(
  {
    title: { type: String, trim: true, required: true },
    description: { type: String, trim: true },
    cover_image: { type: String, required: true },
    musics: [{ type: Schema.ObjectId, ref: "music", default: [] }],
    createBy: { type: Schema.ObjectId, ref: "users", required: true },
    likes: [{ type: Schema.ObjectId, ref: "users", default: [] }],
    genre: { type: Schema.ObjectId, ref: "genre" },
    country: { type: Schema.ObjectId, ref: "country", required: true },
  },
  { timestamps: true }
);

schema.pre(["deleteMany", "deleteOne"], async function (next) {
  try {
    const deletedPlaylist = await this.model.find(this.getFilter());
    const publicFolder = path.join(process.cwd(), "public");
    const playListIds = deletedPlaylist.map((playList) => playList._id);
    const playListFiles = deletedPlaylist.map(
      (playList) => `${publicFolder}${playList.cover_image}`
    );

    rimrafSync(playListFiles);

    await commentModel.deleteMany({ target_id: { $in: playListIds } });
    await categoryModel.updateMany({
      $pull: { target_ids: { $in: playListIds } },
    });

    await serverNotificationModel.deleteMany({
      target_id: { $in: deletedPlaylist },
      type: "playList",
    });

    next();
  } catch (error: any) {
    next(error);
  }
});

schema.pre("save", async function (next) {
  try {
    const existingAutoArchive = await autoArchiveModel.findOne({
      type: "playList",
      country: this.country,
    });

    if (existingAutoArchive) {
      await autoArchiveModel.findOneAndUpdate(existingAutoArchive._id, {
        $push: { target_ids: this._id },
      });
    } else {
      await autoArchiveModel.create({
        type: "playList",
        country: this.country,
        target_ids: this._id,
      });
    }

    next();
  } catch (error: any) {
    next(error);
  }
});

export default model("playList", schema);
