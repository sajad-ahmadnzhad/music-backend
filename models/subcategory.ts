import { Schema, model } from "mongoose";
const schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    createBy: { type: Schema.ObjectId, ref: 'users', required: true}
  },
  { timestamps: true }
);

export default model("subcategory", schema);
