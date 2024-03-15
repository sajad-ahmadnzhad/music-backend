import { ObjectId } from "mongoose";

export interface NotificationBody{
    title: string,
    message: string,
    receiver: string,
    type: string
}