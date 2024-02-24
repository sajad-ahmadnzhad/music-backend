import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    title: { type: String, required: true },
    artist: { type: Schema.ObjectId, ref: "singer", required: true },
    release_date: { type: Number },
    genre: { type: Schema.ObjectId, ref: "genre", required: true },
    description: { type: String },
    cover_image: { type: String },
    createBy: {type: Schema.ObjectId, ref: "users", required: true}
  },
  { timestamps: true }
);

export default model("upcoming", schema);
