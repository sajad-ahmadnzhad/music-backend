import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    musicId: { type: Schema.ObjectId, ref: "music", required: true },
    comment: { type: String, required: true },
    username: { type: String, required: true },
    isAccept: { type: Boolean, default: false },
    score: { type: Number, enum: [1, 2, 3, 4, 5], default: 5 },
    replies: [
      {
        username: { type: String, required: true },
        commentId: { type: Schema.ObjectId, required: true },
        reply: { type: String, maxLength: 2000, required: true },
        createdAt: { type: Date, default: new Date().getTime() },
      },
    ],
  },
  { timestamps: true }
);

export default model("comment", schema);
