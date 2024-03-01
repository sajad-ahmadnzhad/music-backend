import { ObjectId } from "mongoose"

export interface ArchiveBody{
    title: string
    description: string
    genre: ObjectId
    country: ObjectId
}