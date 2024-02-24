import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    title: { type: String, required: true },
    artist: { type: Schema.ObjectId, ref: "singer", required: true },
    duration: { type: String, required: true },
    release_year: { type: Number, default: new Date().getFullYear() },
    cover_image: { type: String, required: true },
    download_link: { type: String, required: true },
    description: { type: String },
    lyrics: { type: String },
    rating: { type: Number, default: 3 },
    count_views: { type: Number, default: 0 },
    count_likes: { type: Number, default: 0 },
    count_downloads: { type: Number, default: 0 },
    likes: [{ type: Schema.ObjectId, ref: "users", default: [] }],
    country: { type: Schema.ObjectId, ref: "country", required: true },
    genre: { type: Schema.ObjectId, ref: "genre", required: true },
    createBy: { type: Schema.ObjectId, ref: "users", required: true },
  },
  { timestamps: true }
);

export default model("music", schema);
