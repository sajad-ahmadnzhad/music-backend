import { NextFunction, Request, Response } from "express";
import notificationModel from "../models/notification";
import { NotificationBody } from "../interfaces/notification";
import httpErrors from "http-errors";
import { isValidObjectId } from "mongoose";
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
export let getUnread = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = req as any;
    const notifications = await notificationModel
      .find({ isRead: false, receiver: user._id })
      .populate("creator", "name username profile")
      .select("-__v -receiver")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    next(error);
  }
};
export let getRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = req as any;
    const notifications = await notificationModel
      .find({ isRead: true, receiver: user._id })
      .populate("creator", "name username profile")
      .select("-__v -receiver")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    next(error);
  }
};
export let remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { user } = req as any;

    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("This notification id is not from mongodb");
    }

    const existingNotification = await notificationModel.findOne({
      _id: id,
      creator: user._id,
    });

    if (!existingNotification) {
      throw httpErrors.NotFound("Notification not found");
    }

    await existingNotification.deleteOne();
    res.json({ message: "Deleted notification successfully" });
  } catch (error) {
    next(error);
  }
};
export let update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as NotificationBody;
    const { id } = req.params;
    const { user } = req as any;

    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("This notification id is not from mongodb");
    }

    if (body.receiver == String(user._id)) {
      throw httpErrors.BadRequest("You cannot send notifications to yourself.");
    }

    const existingNotification = await notificationModel.findOne({
      _id: id,
      creator: user._id,
    });

    if (!existingNotification) {
      throw httpErrors.NotFound("Notification not found");
    }

   await existingNotification.updateOne(body);

    res.json({ message: "Updated notification successfully" });
  } catch (error) {
    next(error);
  }
};
