import { ObjectId } from "mongoose";
export interface CommentsBody {
  body: string;
  music: ObjectId;
  score: number;
}
