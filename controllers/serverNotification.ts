import { NextFunction, Request, Response } from "express";
import serverNotificationModel from "../models/serverNotification";
import { isValidObjectId } from "mongoose";
import httpErrors from "http-errors";

export let getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as any;
    const severNotifications = await serverNotificationModel
      .find({
        receiver: user._id,
      })
      .populate("target_id", "title description image")
      .select("-__v -receiver")
      .sort({ createdAt: -1 })
      .lean();

    res.json(severNotifications);
  } catch (error) {
    next(error);
  }
};
export let read = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as any;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest(
        "This server notification id is not from mongodb"
      );
    }

    const existingServerNotification = await serverNotificationModel.findOne({
      _id: id,
      isRead: false,
      receiver: user._id,
    });

    if (!existingServerNotification) {
      throw httpErrors.NotFound("Sever notification id is not from mongodb");
    }

    await existingServerNotification.updateOne({
      isRead: true,
    });

    res.json({ message: "The sever notification has been read successfully" });
  } catch (error) {
    next(error);
  }
};
export let readAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = req as any;
    const existingServerNotificationUnRead =
      await serverNotificationModel.findOne({
        receiver: user._id,
        isRead: false,
      });

    if (!existingServerNotificationUnRead) {
      throw httpErrors.NotFound("No unread server notification found");
    }

    await serverNotificationModel.updateMany(
      { receiver: user._id },
      {
        isRead: true,
      }
    );

    res.json({
      message: "All sever notifications have been successfully read",
    });
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
    const serverNotifications = await serverNotificationModel
      .find({ isRead: false, receiver: user._id })
      .populate("target_id", "title description image")
      .select("-__v -receiver")
      .sort({ createdAt: -1 })
      .lean();

    res.json(serverNotifications);
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
    const notifications = await serverNotificationModel
      .find({ isRead: true, receiver: user._id })
      .populate("target_id", "title description image")
      .select("-__v -receiver")
      .sort({ createdAt: -1 })
      .lean();

    res.json(notifications);
  } catch (error) {
    next(error);
  }
};
