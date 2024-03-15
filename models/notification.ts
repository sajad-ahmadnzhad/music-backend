import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    creator: {
      type: Schema.ObjectId,
      ref: "users",
      required: true,
    },
    message: {
      type: String,
      trim: true,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "category",
        "music",
        "playList",
        "album",
        "users",
        "upcoming",
        "other",
      ],
      default: "other",
    },
    receiver: {
      type: Schema.ObjectId,
      ref: "users",
      required: true,
    },
  },
  { timestamps: true }
);

export default model("notification", schema);
