import { ObjectId } from "mongoose";
export interface userPlaylistBody {
  title: string;
  description: string;
  genre: ObjectId;
}
