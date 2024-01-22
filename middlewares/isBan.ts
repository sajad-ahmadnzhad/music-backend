import { NextFunction, Request, Response } from "express";
import banUserModel from '../models/banUser'
import httpStatus from "http-status";
export default async(req:Request , res:Response , next:NextFunction) => {
    const { user } = req as any
    
    const isBanUser = await banUserModel.findOne({email:user.email})

    if (!isBanUser)return next()
    
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "You are banned and cannot access this path" });

}