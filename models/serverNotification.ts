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
    createdAt: { type: Date, expires: "7d", default: Date.now },
  },
  { timestamps: true }
);

schema.pre("find", function (next) {
  try {
    this.populate({
      path: "target_id",
      select: "title description image artist cover_image photo",
      populate: [
        {
          path: "artist",
          select: "fullName englishName photo",
          strictPopulate: false,
        },
      ],
    })
      .sort({ createdAt: -1 })
      .select("-__v -receiver")
      .lean();
    next();
  } catch (error: any) {
    next(error);
  }
});

export default model("serverNotification", schema);
