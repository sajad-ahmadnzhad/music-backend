import { NextFunction, Request, Response } from "express";
import serverNotificationModel from "../models/serverNotification";

export let getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as any;
    const severNotifications = await serverNotificationModel
      .find({
        receiver: user._id,
      })
      .populate("target_id", "title description image")
      .select("-__v -receiver")
      .lean()

    res.json(severNotifications);
  } catch (error) {
    next(error);
  }
};
