import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    title: { type: String, required: true },
    artist: { type: String, required: true },
    genre: { type: String, required: true },
    duration: { type: String, required: true },
    release_year: { type: Number, required: true },
    cover_image: { type: String, required: true },
    music: { type: String, required: true },
    description: { type: String },
    rating: { type: Number, default: 3 },
  },
  { timestamps: true }
);

export default model("music", schema);
