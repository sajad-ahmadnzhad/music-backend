import { ObjectId } from "mongoose"

export interface PlayListBody {
    title: string
    description: string
    category: ObjectId
}