import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    creator: { type: Schema.ObjectId, ref: "users", required: true },
    text: { type: String, trim: true, required: true },
    musicId: { type: Schema.ObjectId, ref: "music", required: true },
    isAccept: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model("lyrics", schema);
