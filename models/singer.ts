import { Schema, model } from "mongoose";

const schema = new Schema({
  fullName: { type: String, required: true },
  englishName: { type: String, required: true },
  nickname: { type: String },
  photo: { type: String, required: true },
  nationality: { type: String, required: true },
  countViews: { type: Number, default: 0 },
  countLike: { type: Number, default: 0 },
  musicStyle: { type: Schema.ObjectId, ref: "categories", required: true },
  albums: { type: [Schema.ObjectId], ref: "albums", required: true },
});
export default model("singer", schema);
