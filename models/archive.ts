import { Schema, model } from "mongoose";
import path from "path";
import { rimrafSync } from "rimraf";
const schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    musics: [{ type: Schema.ObjectId, ref: "music", default: [] }],
    artists: [{ type: Schema.ObjectId, ref: "singer", default: [] }],
    albums: [{ type: Schema.ObjectId, ref: "album", default: [] }],
    cover_image: { type: String },
    createBy: { type: Schema.ObjectId, ref: "users", required: true },
    genre: { type: Schema.ObjectId, ref: "genre" },
  },
  { timestamps: true }
);

schema.pre("deleteOne", async function (next) {
  try {
    const deletedArchive = await this.model.findOne(this.getFilter());
    const publicFolder = path.join(process.cwd(), "public");
    rimrafSync(`${publicFolder}${deletedArchive.cover_image}`);
    next();
  } catch (error:any) {
    next(error);
  }
});

export default model("archive", schema);
