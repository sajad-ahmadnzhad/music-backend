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
      enum: ["category", "music", "playList", "album", "users", "upcoming"],
      required: true,
    },
    receiver: {
      type: Schema.ObjectId,
      ref: "users",
      required: true,
    },
    target_id: {
      type: Schema.ObjectId,
      refPath: "type",
      required: true,
    },
  },
  { timestamps: true }
);



export default model("severNotification", schema);
