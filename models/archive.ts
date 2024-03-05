import { Schema, model } from "mongoose";
import path from "path";
import { rimrafSync } from "rimraf";
const schema = new Schema(
  {
    title: { type: String, trim: true, required: true },
    description: { type: String, trim: true },
    musics: [{ type: Schema.ObjectId, ref: "music", default: [] }],
    albums: [{ type: Schema.ObjectId, ref: "album", default: [] }],
    playlists: [{ type: Schema.ObjectId, ref: "playList", default: [] }],
    cover_image: { type: String },
    createBy: { type: Schema.ObjectId, ref: "users", required: true },
    genre: { type: Schema.ObjectId, ref: "genre" },
    country: { type: Schema.ObjectId, ref: "country", required: true },
  },
  { timestamps: true }
);

schema.pre("deleteOne", async function (next) {
  try {
    const deletedArchive = await this.model.findOne(this.getFilter());
    if (!deletedArchive) return next();
    const publicFolder = path.join(process.cwd(), "public");
    rimrafSync(`${publicFolder}${deletedArchive.cover_image}`);
    next();
  } catch (error: any) {
    next(error);
  }
});

export default model("archive", schema);
