import { Schema, model } from "mongoose";
import { rimrafSync } from "rimraf";
import path from "path";
import commentModel from "./comment";
import playListModel from "./playList";
import userFavoriteModel from "./userFavorite";
import userPlaylistModel from "./userPlaylist";
import upcomingModel from "./upcoming";
import albumModel from "./album";
import singerArchiveModel from "./singerArchive";

const schema = new Schema(
  {
    title: { type: String, required: true },
    artist: { type: Schema.ObjectId, ref: "singer", required: true },
    duration: { type: String, required: true },
    release_year: { type: Number, default: new Date().getFullYear() },
    cover_image: { type: String, required: true },
    download_link: { type: String, required: true },
    isSingle: { type: Boolean, required: true },
    description: { type: String },
    lyrics: { type: String },
    rating: { type: Number, default: 3 },
    count_views: { type: Number, default: 0 },
    count_likes: { type: Number, default: 0 },
    count_downloads: { type: Number, default: 0 },
    likes: [{ type: Schema.ObjectId, ref: "users", default: [] }],
    country: { type: Schema.ObjectId, ref: "country", required: true },
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
    await userPlaylistModel.updateMany({
      $pull: { musics: { $in: musicIds } },
      $inc: { count_musics: -1 },
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
    await albumModel.updateMany({ $pull: { musics: deletedMusic._id } });
    await userFavoriteModel.deleteMany({ target_id: deletedMusic._id });
    await userPlaylistModel.updateMany({
      $pull: { musics: deletedMusic._id },
      $inc: { count_musics: -1 },
    });

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
    await upcomingModel.deleteOne({
      title: this.title,
      artist: this.artist,
    });

    await singerArchiveModel.findOneAndUpdate(
      { artist: this.artist },
      {
        $push: { musics: this._id },
        $inc: { count_musics: 1 },
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
