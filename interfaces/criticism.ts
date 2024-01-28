import {ObjectId} from 'mongoose'
export interface CriticismBody {
    type: string
    body: string
    score: number
    target_id: ObjectId
}
