import { Schema, model } from "mongoose";
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

export default model("userPlaylist", schema);
