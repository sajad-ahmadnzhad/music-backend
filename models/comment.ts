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
    isEdited: {
      type: Boolean,
      default: false,
    },
    target_id: {
      type: Schema.Types.ObjectId,
      refPath: "commentType",
      required: true,
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
        default: [],
      },
    ],
    commentType: {
      type: String,
      enum: ["music", "album", "upcoming", "playList"],
      required: true,
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

schema.index({ createdAt: 1 });

export default model("comment", schema);
