import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
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

export default model("severNotification", schema);
