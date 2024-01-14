import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    title: { type: String, required: true },
    parent_id: { type: Schema.ObjectId },
    description: { type: String },
    image: { type: String },
  },
  { timestamps: true }
);

export default model("category", schema);
