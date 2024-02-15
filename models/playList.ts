import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    cover_image: { type: String, required: true },
    musics: [{ type: Schema.ObjectId, ref: "music", default: [] }],
    createBy: { type: Schema.ObjectId, ref: "users", required: true },
    likes: [{ type: Schema.ObjectId, ref: "users", default: [] }],
    count_likes: { type: Number, default: 0 },
    category: { type: Schema.ObjectId, ref: "categories" },
  },
  { timestamps: true }
);

export default model("playList", schema);
