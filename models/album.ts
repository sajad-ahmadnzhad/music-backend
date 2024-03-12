import { Schema, model } from "mongoose";
import { rimrafSync } from "rimraf";
import commentModel from "./comment";
import userFavoriteModel from "./userFavorite";
import singerModel from "./singer";
import archiveModel from "./archive";
import autoArchiveModel from "./autoArchive";
import musicModel from "./music";
import singerArchiveModel from "./singerArchive";
import path from "path";
import categoryModel from "./category";
const schema = new Schema(
  {
    title: { type: String, trim: true, required: true },
    artist: { type: Schema.ObjectId, ref: "singer", required: true },
    photo: { type: String, required: true },
    musics: [{ type: Schema.ObjectId, ref: "music", default: [] }],
    description: { type: String, trim: true },
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
    await categoryModel.updateMany({
      $pull: { target_ids: { $in: albumIds } },
    });
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
    await categoryModel.updateMany({ $pull: { target_ids: deletedAlbum._id } });
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

schema.pre("save", async function (next) {
  try {
    const album = (await this.populate("artist", "country")) as any;
    const existingAutoArchive = await autoArchiveModel.findOne({
      type: "album",
      country: album.artist.country,
    });

    if (existingAutoArchive) {
      await autoArchiveModel.findByIdAndUpdate(existingAutoArchive._id, {
        $push: { target_ids: this._id },
      });
    } else {
      await autoArchiveModel.create({
        type: "album",
        country: album.artist.country,
        target_ids: this._id,
      });
    }

    await singerArchiveModel.findOneAndUpdate(
      { artist: album.artist },
      {
        $push: {
          albums: this._id,
        },
      }
    );

    next();
  } catch (error: any) {
    next(error);
  }
});

export default model("album", schema);
