import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    creator: { type: Schema.ObjectId, ref: "users", required: true },
    type: { type: String, enum: ["music", "singer"], required: true },
    body: { type: String, required: true },
    count_likes: { type: Number, default: 0 },
    count_dislikes: { type: Number, default: 0 },
    mainCriticismId: { type: Schema.ObjectId, ref: 'criticism' },
    score: { type: Number, enum: [1, 2, 3, 4, 5], default: 5 },
    target_id: { type: Schema.ObjectId, refPath: "type", required: true },
    isAccept: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model("criticism", schema);
