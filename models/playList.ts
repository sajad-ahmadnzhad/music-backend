import { Schema, model } from "mongoose";
import commentModel from "./comment";
import path from "path";
import { rimrafSync } from "rimraf";
const schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    cover_image: { type: String, required: true },
    musics: [{ type: Schema.ObjectId, ref: "music", default: [] }],
    createBy: { type: Schema.ObjectId, ref: "users", required: true },
    likes: [{ type: Schema.ObjectId, ref: "users", default: [] }],
    count_likes: { type: Number, default: 0 },
    genre: { type: Schema.ObjectId, ref: "genre" },
    country: { type: Schema.ObjectId, ref: "country", required: true },
  },
  { timestamps: true }
);

schema.pre("deleteMany", async function (next) {
  try {
    const deletedPlaylist = await this.model.find(this.getFilter());
    const publicFolder = path.join(process.cwd(), "public");
    const playListIds = deletedPlaylist.map((playList) => playList._id);
    const playListFiles = deletedPlaylist.map(
      (playList) => `${publicFolder}${playList.cover_image}`
    );

    rimrafSync(playListFiles);

    await commentModel.deleteMany({ target_id: { $in: playListIds } });

    next();
  } catch (error: any) {
    next(error);
  }
});

export default model("playList", schema);
