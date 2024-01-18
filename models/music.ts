import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    title: { type: String, required: true },
    artist: { type: String, required: true },
    duration: { type: String, required: true },
    release_year: { type: Number, required: true },
    cover_image: { type: String, required: true },
    download_link: { type: String, required: true },
    description: { type: String },
    rating: { type: Number, default: 3 },
    count_views: { type: Number, default: 0 },
    count_likes: { type: Number, default: 0 },
    count_downloads: { type: Number, default: 0 },
    genre: { type: Schema.ObjectId, ref: "categories", required: true },
    createBy: { type: Schema.ObjectId, ref: "users", required: true },
    albums: { type: Schema.ObjectId, ref: "albums" },
  },
  { timestamps: true }
);

export default model("music", schema);
