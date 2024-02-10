import { Schema, model } from "mongoose";
const schema = new Schema(
  {
    creator: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    reports: [
      {
        type: Schema.ObjectId,
        ref: "users",
        default: [],
      },
    ],
    like: [
      {
        type: Schema.ObjectId,
        ref: "users",
        default: [],
      },
    ],
    dislike: [
      {
        type: Schema.ObjectId,
        ref: "users",
        default: [],
      },
    ],
    edited: {
      type: Boolean,
      default: false,
    },
    musicId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "music",
    },
    body: {
      type: String,
      required: true,
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "comment",
      default: null,
    },
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "comment",
      },
    ],
  },
  { timestamps: true }
);

schema.index({ createdAt: 1 });

export default model("comment", schema);
