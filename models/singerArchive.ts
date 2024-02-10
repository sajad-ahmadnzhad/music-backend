import { Schema, model } from "mongoose";
const schema = new Schema(
  {
    artist: { type: Schema.ObjectId, ref: "singer", required: true },
    musics: [{ type: Schema.ObjectId, ref: "music", default: [] }],
    count_musics: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default model("singerArchive", schema);
