import { NextFunction, Request, Response } from "express";
import notificationModel from "../models/notification";
import { NotificationBody } from "../interfaces/notification";
import httpErrors from "http-errors";
export let create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as NotificationBody;
    const { user } = req as any;

    if (body.receiver == String(user._id)) {
      throw httpErrors.BadRequest("You cannot send notifications to yourself.");
    }

    await notificationModel.create({
      ...body,
      creator: user._id,
    });

    res.json({ message: "Create notification successfully" });
  } catch (error) {
    next(error);
  }
};
export let getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as any;
    const notifications = await notificationModel
      .find({ receiver: user._id })
      .populate("creator", "name username profile")
      .select("-__v -receiver")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    next(error);
  }
};
export let unread = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {user} = req as any
    const notifications = await notificationModel
      .find({ isRead: false , receiver: user._id })
      .populate("creator", "name username profile")
      .select("-__v -receiver")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    next(error);
  }
};
