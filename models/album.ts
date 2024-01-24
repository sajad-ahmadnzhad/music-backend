import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    title: { type: String, required: true },
    artist: { type: Schema.ObjectId, ref: "singer", required: true },
    photo: { type: String, required: true },
    musics: [{type: Schema.ObjectId , ref: 'music' , default: []}],
    description: { type: String },
    duration: { type: String, default: '00:00' },
    countMusics: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default model("albums", schema);
