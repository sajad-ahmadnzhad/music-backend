import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    musics: [{ type: Schema.ObjectId, ref: "music", default: [] }],
    artists: [{ type: Schema.ObjectId, ref: "singer" , default: []}],
    album: [{ type: Schema.ObjectId, ref: "albums", default: [] }],
    cover_image: { type: String },
    createBy: { type: Schema.ObjectId, ref: "users", required: true },
    genre: { type: Schema.ObjectId, ref: "category" },
  },
  { timestamps: true }
);

export default model("archive", schema);
