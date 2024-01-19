import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    user: { type: Schema.ObjectId, ref: "users", required: true },
    type: { type: String, enum: ["music", "singer"], required: true },
    body: { type: String, required: true },
    score: { type: Number, enum: [1, 2, 3, 4, 5], default: 5 },
    target_id: { type: Schema.ObjectId, refPath: "type", required: true },
    isAccept: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model("criticism", schema);
