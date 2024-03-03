//body auth register controller 
import {Types} from 'mongoose'
export interface RegisterBody {
  name: string;
  username: string;
  email: string;
  password: string;
}

//body auth login controller
export interface LoginBody {
  identifier: string;
  password: string;
}

export interface SendMailOptions {
  from: string
  to: string
  subject: string
  html: string
  userId?: Types.ObjectId
}