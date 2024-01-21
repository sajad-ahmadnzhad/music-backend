import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    cover_image: { type: String },
    musics: [{ type: Schema.ObjectId, ref: "music", default: [] }],
    artist: { type: Schema.ObjectId, ref: "singers", required: true },
    createBy: { type: Schema.ObjectId, ref: "users", required: true },
    genre: { type: Schema.ObjectId, ref: "category" },
  },
  { timestamps: true }
);

export default model("archive", schema);
