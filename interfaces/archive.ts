import { ObjectId } from "mongoose"

export interface ArchiveBody{
    title: string
    description: string
    artist: ObjectId
    genre: ObjectId
    country: ObjectId
}