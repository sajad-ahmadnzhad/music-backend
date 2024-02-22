import { Schema, model } from "mongoose";
const schema = new Schema(
  {
    title: { type: String, required: true },
    image: { type: String },
    sub_category: [{ type: Schema.ObjectId, ref: "subCategory", required: true }],
    description: { type: String },
  },
  { timestamps: true }
);

export default model("category", schema);
