import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    title: { type: String, required: true },
    singer: { type: Schema.ObjectId, ref: "singer", required: true },
    photo: { type: String, required: true },
    description: { type: String },
    duration: { type: String, required: true },
    countMusic: { type: Number, required: true },
  },
  { timestamps: true }
);

export default model("albums", schema);
