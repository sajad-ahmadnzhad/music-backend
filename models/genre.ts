import { Schema, model } from "mongoose";
import singerModel from "./singer";
import playListModel from "./playList";
import userPlaylistModel from "./userPlaylist";
import archiveModel from "../models/archive";
const schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    createBy: { type: Schema.ObjectId, ref: "users", required: true },
  },
  { timestamps: true }
);

schema.pre("deleteOne", async function (next) {
  try {
    const deletedGenre = await this.model.findOne(this.getFilter());
    if(!deletedGenre) return next()
    await singerModel.deleteMany({ musicStyle: deletedGenre._id });
    await playListModel.deleteMany({ genre: deletedGenre._id });
    await userPlaylistModel.deleteMany({ genre: deletedGenre._id });
    await archiveModel.deleteMany({ genre: deletedGenre._id });
    next();
  } catch (error:any) {
    next(error);
  }
});

export default model("genre", schema);
