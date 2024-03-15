import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    creator: { type: Schema.ObjectId, ref: "users", required: true },
    text: { type: String, trim: true, required: true },
    musicId: { type: Schema.ObjectId, ref: "music", required: true },
    isAccept: { type: Boolean, default: false },
    isReject: { type: Boolean, default: false },
  },
  { timestamps: true }
);

schema.pre("find", function (next) {
  try {
    this.populate({
      path: "musicId",
      select: "title cover_image artist",
      populate: [{ path: "artist", select: "fullName photo" }],
    })
      .populate("creator", "name username profile")
      .select("-__v");

    next();
  } catch (error: any) {
    next(error);
  }
});

export default model("lyrics", schema);
