import { Schema, model } from "mongoose";
const schema = new Schema(
  {
    title: { type: String, required: true },
    image: { type: String },
    description: { type: String },
    createBy: { type: Schema.ObjectId, ref: "users", required: true },
  },
  { timestamps: true }
);

export default model("country", schema);
