import { Schema, model } from "mongoose";
const schema = new Schema(
  {
    artist: { type: Schema.ObjectId, ref: "singer", required: true },
    musics: [{ type: Schema.ObjectId, ref: "music", default: [] }],
    albums: [{ type: Schema.ObjectId, ref: "album", default: [] }],
  },
  { timestamps: true }
);

export default model("singerArchive", schema);
