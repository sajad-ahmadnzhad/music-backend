import { model, Schema } from "mongoose";

const schema = new Schema({
  userId: {
    type: Schema.ObjectId,
    ref: "users",
    required: true,
    unique: true,
  },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now(), expires: 3600 }, //1h
});

export default model("token", schema);
