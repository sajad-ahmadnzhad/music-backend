import { ObjectId } from "mongoose";

export interface upcomingBody {
  title: string;
  description: string;
  artist: ObjectId;
  country: ObjectId;
  genre: ObjectId;
  release_date: number;
}
