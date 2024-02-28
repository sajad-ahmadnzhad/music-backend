import {ObjectId} from 'mongoose'
export interface CommentsBody {
  body: string;
  type: string
  targetId: ObjectId
}
