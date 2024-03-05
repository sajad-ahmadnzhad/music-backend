import { Schema, model } from "mongoose";
import path from "path";
import { rimrafSync } from "rimraf";
import singerModel from "./singer";
import playListModel from "./playList";
const schema = new Schema(
  {
    title: { type: String, trim: true, required: true },
    image: { type: String },
    description: { type: String, trim: true },
    createBy: { type: Schema.ObjectId, ref: "users", required: true },
  },
  { timestamps: true }
);

schema.pre("deleteOne", async function (next) {
  try {
    const deletedCountry = await this.model.findOne(this.getFilter());
    if(!deletedCountry) return next()
    const publicFolder = path.join(process.cwd(), "public");
    rimrafSync(`${publicFolder}${deletedCountry.image}`);
    await singerModel.deleteMany({ country: deletedCountry._id });
    await playListModel.deleteMany({ country: deletedCountry._id });
    next();
  } catch (error: any) {
    next(error);
  }
});

export default model("country", schema);
