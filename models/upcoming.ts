import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    title: { type: String, required: true },
    artist: { type: Schema.ObjectId, ref: "singer", required: true },
    release_date: { type: Number },
    genre: { type: Schema.ObjectId, ref: "categories", required: true },
    description: { type: String },
    cover_image: { type: String },
  },
  { timestamps: true }
);

export default model("upcoming", schema);
