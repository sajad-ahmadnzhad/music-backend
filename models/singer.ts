import { Document, Schema, model } from "mongoose";
import path from "path";
import { rimrafSync } from "rimraf";
import musicModel from "../models/music";
import albumModel from "../models/album";
import archiveModel from "../models/archive";
import autoArchiveModel from "../models/autoArchive";
import singerArchiveModel from "../models/singerArchive";
import upcomingModel from "../models/upcoming";
const schema = new Schema(
  {
    fullName: { type: String, trim: true, required: true },
    englishName: { type: String, trim: true, required: true },
    nickname: { type: String, trim: true },
    photo: { type: String, required: true },
    country: { type: Schema.ObjectId, ref: "country", required: true },
    count_likes: { type: Number, default: 0 },
    likes: [{ type: Schema.ObjectId, ref: "users", default: [] }],
    musicStyle: { type: Schema.ObjectId, ref: "genre", required: true },
    album: [{ type: Schema.ObjectId, ref: "album", default: [] }],
    createBy: { type: Schema.ObjectId, ref: "users", required: true },
  },
  { timestamps: true }
);

schema.pre("deleteOne", async function (next) {
  try {
    const deletedSinger = await this.model.findOne(this.getFilter());
    if (!deletedSinger) return next();
    const publicFolder = path.join(process.cwd(), "public");
    const file = `${publicFolder}${deletedSinger.photo}`;
    rimrafSync(file);

    await albumModel.deleteMany({ artist: deletedSinger._id });
    await musicModel.deleteMany({ artist: deletedSinger._id });
    await archiveModel.deleteMany({ artist: deletedSinger._id });
    await singerArchiveModel.deleteOne({ artist: deletedSinger._id });
    await upcomingModel.deleteMany({ artist: deletedSinger._id });
    next();
  } catch (error: any) {
    next(error);
  }
});

schema.pre("deleteMany", async function (next) {
  try {
    const deletedSinger = await this.model.find(this.getFilter());
    const publicFolder = path.join(process.cwd(), "public");
    const files = deletedSinger.map(
      (singer) => `${publicFolder}${singer.photo}`
    );
    const singerIds = deletedSinger.map((singer) => singer._id);
    rimrafSync(files);

    await albumModel.deleteMany({ artist: { $in: singerIds } });
    await musicModel.deleteMany({ artist: { $in: singerIds } });
    await archiveModel.deleteMany({ artist: { $in: singerIds } });
    await singerArchiveModel.deleteOne({ artist: { $in: singerIds } });
    await upcomingModel.deleteMany({ artist: { $in: singerIds } });
    next();
  } catch (error: any) {
    next(error);
  }
});

schema.pre("save", async function (next) {
  try {
    const existingAutoArchive = await autoArchiveModel.findOne({
      type: "singer",
      country: this.country,
    });

    if (existingAutoArchive) {
      await existingAutoArchive.updateOne({
        $push: { target_ids: this._id },
      });
    } else {
      await autoArchiveModel.create({
        type: "singer",
        country: this.country,
        target_ids: this._id,
      });
    }

    next();
  } catch (error: any) {
    next(error);
  }
});

export default model("singer", schema);
