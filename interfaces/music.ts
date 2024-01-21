import { Schema } from "mongoose";

//body api to make music
export interface MusicBody {
  title: string;
  artist: Schema.Types.ObjectId;
  genre: Schema.Types.ObjectId;
  duration: string;
  release_year: number;
  description: string;
  lyrics: string;
  album: Schema.Types.ObjectId
}

//Setting the type for the body of the files sent by the admin
interface propertyMusicFiles {
  path: string;
  filename: string;
}
export interface MusicFile {
  cover: propertyMusicFiles[];
  music: propertyMusicFiles[];
}
