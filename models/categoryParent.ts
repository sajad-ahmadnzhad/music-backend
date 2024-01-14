import { Schema, model } from "mongoose";
const schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  image: { type: String },
});

export default model("categoryParent", schema);
