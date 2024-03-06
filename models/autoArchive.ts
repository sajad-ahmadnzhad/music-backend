import { Schema, model } from "mongoose";
const schema = new Schema(
  {
    type: {
      type: String,
      enum: ["playList", "singer", "album", "music", "upcoming"],
      required: true,
    },
    target_ids: [{ type: Schema.ObjectId, refPath: "type", default: [] }],
    country: { type: String, ref: "country", required: true },
  },
  { timestamps: true }
);

schema.pre(["find", "findOne"], function (next) {
  try {
    this.populate({
      path: "target_ids",
      select:
        "title description artist genre cover_image fullName englishName nickname photo musicStyle download_link",
      populate: [
        {
          path: "artist",
          select: "fullName englishName photo musicStyle",
          strictPopulate: false,
          populate: [
            {
              path: "musicStyle",
              select: "title description",
              strictPopulate: false,
            },
          ],
        },
        {
          path: "musicStyle",
          select: "title description",
          strictPopulate: false,
        },
        { path: "genre", select: "title description", strictPopulate: false },
      ],
    })
      .populate("country", "title description image")
      .select("-__v")
      .sort({ createdAt: -1 })
      .lean();
    next();
  } catch (error: any) {
    next(error);
  }
});

export default model("autoArchive", schema);
