import { Schema, model } from "mongoose";
const schema = new Schema(
  {
    type: {
      type: String,
      enum: ["playList", "singer", "album", "music", "upcoming"],
      required: true,
    },
    target_id: [{ type: Schema.ObjectId, refPath: "type", default: [] }],
    country: { type: String, ref: "country", required: true },
  },
  { timestamps: true }
);

export default model("autoArchive", schema);
