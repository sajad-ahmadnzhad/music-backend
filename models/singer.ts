import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    fullName: { type: String, required: true },
    englishName: { type: String, required: true },
    nickname: { type: String },
    photo: { type: String, required: true },
    nationality: { type: String, required: true },
    count_likes: { type: Number, default: 0 },
    likes: [{ type: Schema.ObjectId, ref: "users", default: [] }],
    musicStyle: { type: Schema.ObjectId, ref: "genre", required: true },
    album: [{ type: Schema.ObjectId, ref: "albums", default: [] }],
    createBy: { type: Schema.ObjectId, ref: "users", required: true },
  },
  { timestamps: true }
);

export default model("singer", schema);
