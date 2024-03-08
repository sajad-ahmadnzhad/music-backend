import { Schema, model } from "mongoose";
import path from "path";
import { rimrafSync } from "rimraf";
import singerModel from "./singer";
import playListModel from "./playList";
import archiveModel from "./archive";
import autoArchiveModel from "./autoArchive";
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
    if (!deletedCountry) return next();
    const publicFolder = path.join(process.cwd(), "public");
    rimrafSync(`${publicFolder}${deletedCountry.image}`);
    await singerModel.deleteMany({ country: deletedCountry._id });
    await playListModel.deleteMany({ country: deletedCountry._id });
    await archiveModel.deleteMany({ country: deletedCountry._id });
    await autoArchiveModel.deleteMany({ country: deletedCountry._id });
    next();
  } catch (error: any) {
    next(error);
  }
});

schema.pre("deleteMany", async function (next) {
  try {
    const deletedCountries = await this.model.find(this.getFilter());
    const publicFolder = path.join(process.cwd(), "public");
    const countryIds = deletedCountries.map((country) => country._id);
    const countriesFile = deletedCountries.map(
      (country) => `${publicFolder}${country.image}`
    );
    rimrafSync(countriesFile);
    await singerModel.deleteMany({ country: { $in: countryIds } });
    await playListModel.deleteMany({ country: { $in: countryIds } });
    await archiveModel.deleteMany({ country: { $in: countryIds } });
    await autoArchiveModel.deleteMany({ country: { $in: countryIds } });
    next();
  } catch (error: any) {
    next(error);
  }
});

export default model("country", schema);
