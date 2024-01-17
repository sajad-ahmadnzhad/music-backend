import { Schema, model } from "mongoose";

const schema = new Schema({
  fullName: { type: String, required: true },
  photo: { type: String, required: true },
  nickname: { type: String },
  englishName: { type: String, required: true },
  musicStyle: { type: Schema.ObjectId, ref: 'categories', required: true },
});

export default model("singer", schema);
