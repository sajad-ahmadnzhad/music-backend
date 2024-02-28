import { Schema, model } from "mongoose";
import path from "path";
import { rimrafSync } from "rimraf";
import commentModel from "./comment";
const schema = new Schema(
  {
    title: { type: String, required: true },
    artist: { type: Schema.ObjectId, ref: "singer", required: true },
    release_date: { type: Number },
    genre: { type: Schema.ObjectId, ref: "genre", required: true },
    country: { type: Schema.ObjectId, ref: "country", required: true },
    description: { type: String },
    cover_image: { type: String },
    createBy: { type: Schema.ObjectId, ref: "users", required: true },
  },
  { timestamps: true }
);

schema.pre("deleteMany", async function (next) {
  try {
    const deletedUpcoming = await this.model.find(this.getFilter());
    const upcomingIds = deletedUpcoming.map((upcoming) => upcoming._id);
    const publicFolder = path.join(process.cwd(), "public");
    const upcomingFiles = deletedUpcoming.map(
      (upcoming) => `${publicFolder}${upcoming.cover_image}`
    );

    rimrafSync(upcomingFiles);

    await commentModel.deleteMany({ target_id: { $in: upcomingIds } });

    next();
  } catch (error: any) {
    next(error);
  }
});

export default model("upcoming", schema);
