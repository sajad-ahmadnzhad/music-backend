import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    body: { type: String, required: true },
    mainCommentID: { type: Schema.ObjectId, ref: "comment" },
    isAccept: { type: Boolean, default: false },
    music: { type: Schema.ObjectId, ref: "music", required: true },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    score: { type: Number, enum: [1, 2, 3, 4, 5], default: 5 },
    creator: { type: Schema.ObjectId, ref: "users", required: true },
  },
  { timestamps: true }
);

export default model("comment", schema);
