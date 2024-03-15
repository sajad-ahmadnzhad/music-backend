import { Schema, model } from "mongoose";
import { rimrafSync } from "rimraf";
import path from "path";
import commentModel from "./comment";
import playListModel from "./playList";
import userFavoriteModel from "./userFavorite";
import userPlaylistModel from "./userPlaylist";
import upcomingModel from "./upcoming";
import albumModel from "./album";
import autoArchiveModel from "./autoArchive";
import singerArchiveModel from "./singerArchive";
import categoryModel from "./category";
import lyricsModel from "./lyrics";

const schema = new Schema(
  {
    title: { type: String, trim: true, required: true },
    artist: { type: Schema.ObjectId, ref: "singer", required: true },
    duration: { type: String, required: true },
    release_year: { type: Number, default: new Date().getFullYear() },
    cover_image: { type: String, required: true },
    download_link: { type: String, required: true },
    isSingle: { type: Boolean, required: true },
    description: { type: String, trim: true },
    lyrics: { type: String, trim: true },
    rating: { type: Number, default: 3 },
    count_views: { type: Number, default: 0 },
    count_likes: { type: Number, default: 0 },
    count_downloads: { type: Number, default: 0 },
    likes: [{ type: Schema.ObjectId, ref: "users", default: [] }],
    country: { type: Schema.ObjectId, ref: "country", required: true },
    album: { type: Schema.ObjectId, ref: "album" },
    genre: { type: Schema.ObjectId, ref: "genre", required: true },
    createBy: { type: Schema.ObjectId, ref: "users", required: true },
  },
  { timestamps: true }
);

schema.pre("deleteMany", async function (next) {
  try {
    const deletedMusics = await this.model.find(this.getFilter());
    const musicIds = deletedMusics.map((music) => music._id);
    const publicFolder = path.join(process.cwd(), "public");
    const musicFiles = deletedMusics.flatMap((music) => [
      `${publicFolder}${music.download_link}`,
      `${publicFolder}${music.cover_image}`,
    ]);

    await playListModel.updateMany({ $pull: { musics: { $in: musicIds } } });
    await albumModel.updateMany({ $pull: { musics: { $in: musicIds } } });
    await userFavoriteModel.deleteMany({ target_id: { $in: musicIds } });
    await lyricsModel.deleteMany({ musicId: { $in: musicIds } });
    await categoryModel.updateMany({
      $pull: { target_ids: { $in: musicIds } },
    });
    await userPlaylistModel.updateMany({
      $pull: { musics: { $in: musicIds } },
    });

    rimrafSync(musicFiles);

    await commentModel.deleteMany({ target_id: { $in: musicIds } });

    next();
  } catch (error: any) {
    next(error);
  }
});

schema.pre("deleteOne", async function (next) {
  try {
    const deletedMusic = await this.model.findOne(this.getFilter());
    if (!deletedMusic) return next();
    const publicFolder = path.join(process.cwd(), "public");
    rimrafSync([
      `${publicFolder}${deletedMusic.cover_image}`,
      `${publicFolder}${deletedMusic.download_link}`,
    ]);

    await playListModel.updateMany({ $pull: { musics: deletedMusic._id } });
    await userFavoriteModel.deleteMany({ target_id: deletedMusic._id });
    await albumModel.updateMany({ $pull: { musics: deletedMusic._id } });
    await categoryModel.updateMany({ $pull: { target_ids: deletedMusic._id } });
    await userPlaylistModel.updateMany({ $pull: { musics: deletedMusic._id } });
    await lyricsModel.deleteMany({ musicId: deletedMusic._id });
    await commentModel.deleteMany({ target_id: deletedMusic._id });

    await singerArchiveModel.findOneAndUpdate(
      { artist: deletedMusic.artist },
      {
        $pull: { musics: deletedMusic._id },
        $inc: { count_musics: -1 },
      }
    );

    next();
  } catch (error: any) {
    next(error);
  }
});

schema.pre("save", async function (next) {
  try {
    const existingAutoArchive = await autoArchiveModel.findOne({
      type: "music",
      country: this.country,
    });

    if (existingAutoArchive) {
      await autoArchiveModel.findOneAndUpdate(existingAutoArchive._id, {
        $push: { target_ids: this._id },
      });
    } else {
      await autoArchiveModel.create({
        type: "music",
        country: this.country,
        target_ids: this._id,
      });
    }

    await upcomingModel.deleteOne({
      title: this.title,
      artist: this.artist,
    });

    await singerArchiveModel.findOneAndUpdate(
      { artist: this.artist },
      {
        $push: { musics: this._id },
      }
    );

    await albumModel.findOneAndUpdate(
      { artist: this.artist },
      {
        $push: { musics: this._id },
      }
    );

    next();
  } catch (error: any) {
    next(error);
  }
});

export default model("music", schema);
