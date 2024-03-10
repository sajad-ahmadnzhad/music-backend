import { ObjectId } from "mongoose";
export interface CategoryBody {
  title: string;
  description: string;
  type: string;
  accessLevel: string;
  genre: ObjectId;
  country: ObjectId;
  collaborators: string[];
}
