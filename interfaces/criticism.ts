import {ObjectId} from 'mongoose'
export default interface CriticismBody {
    type: string
    body: string
    score: number
    target_id: ObjectId
}
