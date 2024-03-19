import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    user: { type: String, ref: "users", required: true },
    type: { type: String, enum: ["music", "album", "singer"], required: true },
    target_id: { type: Schema.ObjectId, refPath: "type", required: true },
  },
  { timestamps: true }
);

schema.pre(["find", "findOne"], function (next) {
  try {
    this.populate({
      path: "target_id",
      select:
        "title photo cover_image download_link fullName englishName country musicStyle genre",
      populate: [
        {
          path: "country",
          select: "title description photo",
          strictPopulate: false,
        },
        {
          path: "musicStyle",
          select: "title description",
          strictPopulate: false,
        },
        { path: "genre", select: "title description", strictPopulate: false },
      ],
    }).sort({ createdAt: -1 });
    next();
  } catch (error: any) {
    next(error);
  }
});

export default model("userFavorite", schema);
