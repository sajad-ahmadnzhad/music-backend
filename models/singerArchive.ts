import { Schema, model } from "mongoose";
const schema = new Schema(
  {
    artist: { type: Schema.ObjectId, ref: "singer", required: true },
    musics: [{ type: Schema.ObjectId, ref: "music", default: [] }],
    albums: [{ type: Schema.ObjectId, ref: "album", default: [] }],
  },
  { timestamps: true }
);

schema.pre(["findOne", "find"], function (next) {
  try {
    this.populate({
      path: "artist",
      select: "fullName englishName photo country musicStyle",
      populate: [
        { path: "country", select: "title description image" },
        { path: "musicStyle", select: "title description" },
      ],
    })
      .populate({
        path: "albums",
        select: "-__v -artist",
        populate: [
          { path: "createBy", select: "name username profile" },
          {
            path: "musics",
            select: "title release_year cover_image download_link",
          },
        ],
      })
      .populate({
        path: "musics",
        select:
          "title release_year duration cover_image download_link genre rating",
        populate: [{ path: "genre", select: "title description" }],
      })
      .select("-__v")
      .sort({ createdAt: -1 });
    next();
  } catch (error: any) {
    next(error);
  }
});

export default model("singerArchive", schema);
