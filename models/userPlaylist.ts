import { Schema, model } from "mongoose";
import { rimrafSync } from "rimraf";
import path from "path";
const schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    musics: [{ type: Schema.ObjectId, ref: "music", default: [] }],
    cover: { type: String },
    createBy: { type: Schema.ObjectId, ref: "users", required: true },
    count_musics: { type: Number, default: 0 },
    genre: { type: Schema.ObjectId, ref: "genre" },
  },
  { timestamps: true }
);

schema.pre("deleteMany", async function (next) {
  try {
    const deletedUser = await this.model.find(this.getFilter());
    const publicFolder = path.join(process.cwd(), "public");
    const userPlaylistCovers = deletedUser.map(
      (userPlaylist) => `${publicFolder}${userPlaylist.cover}`
    );
    rimrafSync(userPlaylistCovers);
  } catch (error: any) {
    next(error);
  }
});

export default model("userPlaylist", schema);
