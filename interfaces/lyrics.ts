import { ObjectId } from "mongoose";

export interface LyricsBody {
  text: string;
  musicId: ObjectId;
}
