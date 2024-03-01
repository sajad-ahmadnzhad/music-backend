import { Schema, model } from "mongoose";
import { rimrafSync } from "rimraf";
import commentModel from "./comment";
import userFavoriteModel from "./userFavorite";
import singerModel from "./singer";
import archiveModel from "./archive";
import musicModel from "./music";
import path from "path";
const schema = new Schema(
  {
    title: { type: String, required: true },
    artist: { type: Schema.ObjectId, ref: "singer", required: true },
    photo: { type: String, required: true },
    musics: [{ type: Schema.ObjectId, ref: "music", default: [] }],
    description: { type: String },
    countMusics: { type: Number, default: 0 },
    createBy: { type: Schema.ObjectId, ref: "users", required: true },
  },
  { timestamps: true }
);

schema.pre("deleteMany", async function (next) {
  try {
    const deletedAlbum = await this.model.find(this.getFilter());
    const albumIds = deletedAlbum.map((album) => album._id);
    const publicFolder = path.join(process.cwd(), "public");
    const albumPhotos: string[] = deletedAlbum.map(
      (album) => `${publicFolder}${album.photo}`
    );
    rimrafSync(albumPhotos);
    await commentModel.deleteMany({ target_id: { $in: albumIds } });
    await userFavoriteModel.deleteMany({ target_id: { $in: albumIds } });

    next();
  } catch (error: any) {
    next(error);
  }
});

schema.pre("deleteOne", async function (next) {
  try {
    const deletedAlbum = await this.model.findOne(this.getFilter());
    if (!deletedAlbum) return next();
    const publicFolder = path.join(process.cwd(), "public");
    rimrafSync(`${publicFolder}${deletedAlbum.photo}`);
    await commentModel.deleteMany({ target_id: deletedAlbum._id });
    await userFavoriteModel.deleteMany({ target_id: deletedAlbum._id });
    await singerModel.findByIdAndUpdate(deletedAlbum.artist, {
      $pull: { album: deletedAlbum._id },
    });
    await archiveModel.updateMany({
      $pull: { albums: deletedAlbum._id },
    });
    await musicModel.deleteMany({
      album: deletedAlbum._id,
    });
    next();
  } catch (error: any) {
    next(error);
  }
});

export default model("album", schema);
