import { NextFunction, Request, Response } from "express";
import usersModel from "../models/users";
import banUserModel from "../models/banUser";
import { isValidObjectId } from "mongoose";
import httpStatus from "http-status";
import { RegisterBody } from "./../interfaces/auth";
import bcrypt from "bcrypt";
import path from "path";
import fs from "fs";
import createHttpError from "http-errors";

export let myAccount = async (req: Request, res: Response) => {
  const { user } = req as any;
  res.json(user);
};

export let getAll = async (req: Request, res: Response) => {
  const users = await usersModel.find({}).lean().select("-password -_id -__v");
  res.json(users);
};

export let changeRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    if (!isValidObjectId(id)) throw createHttpError.BadRequest("This id is not from mongodb");
    const user = await usersModel.findById(id);

    if (!user) throw createHttpError.NotFound("User not found");

    if (user.isSuperAdmin) throw createHttpError.BadRequest("You cannot change the super admin role");

    const changedRole = await usersModel.findOneAndUpdate({ _id: user._id }, { isAdmin: user.isAdmin ? false : true }, { new: true });
    res.json({
      message: `Role changed to ${changedRole!.isAdmin ? "admin" : "user"} successfully`,
    });
  } catch (error) {
    next(error);
  }
};

export let ban = async (req: Request, res: Response) => {
  const admin = (req as any).user;
  const id = req.params.id;

  if (!isValidObjectId(id)) createHttpError.BadRequest("This id is not from mongodb");

  const user = await usersModel.findOne({ _id: id });
  if (!user) createHttpError.NotFound("User not found");

  if (user?.isAdmin && !admin.isSuperAdmin) createHttpError.BadRequest("You cannot ban an admin, this feature is only available for super admin.");

  if (user?.isSuperAdmin) createHttpError.BadRequest("You cannot ban a super admin");

  const banUser = await banUserModel.findOne({ email: user?.email });

  if (banUser) createHttpError.BadRequest("This user has already been blocked");

  await banUserModel.create({ email: user?.email });
  res.json({ message: "The user was successfully banned" });
};

export let unban = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!isValidObjectId(id)) {
    res.status(httpStatus.BAD_REQUEST).json({ message: "This id is not from mongodb" });
    return;
  }
  const user = await banUserModel.findById(id);
  if (!user) {
    res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
    return;
  }

  const isUserAdmin = await usersModel.findOne({ email: user.email });

  if (isUserAdmin!.isAdmin && !(req as any).user.isSuperAdmin) {
    res.status(httpStatus.BAD_REQUEST).json({
      message: "This person is banned by super admin and only super admin can unban her",
    });
    return;
  }

  const unBanUser = await banUserModel.findOneAndDelete({ _id: id });

  res.json({
    message: `User ${unBanUser!.email} has been successfully removed from the banned list`,
  });
};

export let getAllBan = async (req: Request, res: Response) => {
  const usersBlocked = await banUserModel.find().select("-__v");
  res.json(usersBlocked);
};

export let remove = async (req: Request, res: Response) => {
  const id = req.params.id;
  const admin = (req as any).user;

  if (!isValidObjectId(id)) {
    res.status(httpStatus.BAD_REQUEST).json({ message: "This id is not from mongodb" });
    return;
  }
  const user = await usersModel.findOne({ _id: id });
  if (!user) {
    res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
    return;
  }

  if (user.isAdmin) {
    if (!admin.isSuperAdmin) {
      res.status(httpStatus.BAD_REQUEST).json({
        message: "You cannot remove an admin, this feature is only available for super admin.",
      });

      return;
    }
  }

  if (user.isSuperAdmin) {
    res.status(httpStatus.BAD_REQUEST).json({ message: "You cannot remove a super admin" });
    return;
  }

  if (!user.profile.includes("customProfile")) {
    fs.unlinkSync(path.join(__dirname, "../", "public", "usersProfile", user.profile));
  }

  await usersModel.deleteOne({ _id: id });

  res.json({
    message: `User ${user.email} has been successfully removed from the user list`,
  });
};

export let update = async (req: Request, res: Response) => {
  let { name, username, email, password } = req.body as RegisterBody;
  name = name.trim();
  username = username.trim();
  email = email.trim();
  password = password.trim();
  const { user } = req as any;

  if (req.file) {
    if (!user.profile?.includes("customProfile")) {
      fs.unlinkSync(path.join(__dirname, "../", "public", "usersProfile", user.profile));
    }
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const updatedUser = await usersModel
    .findOneAndUpdate(
      { _id: user._id },
      {
        name,
        username,
        email,
        password: hashedPassword,
        profile: req.file ? `/usersProfile/${req.file.filename}` : user.profile,
      },
      { new: true }
    )
    .select("-password");
  res.json({ message: "user updated successfully", updatedUser });
};

export let getAllAdmin = async (req: Request, res: Response) => {
  const admins = (await usersModel.find({}).select("-__v -password")).filter((admin) => admin.isAdmin);
  res.json(admins);
};

export let search = async (req: Request, res: Response) => {
  const { user } = req.query;

  const foundUsers = await usersModel
    .find({
      $or: [{ name: user }, { username: user }, { email: user }],
    })
    .select("-password");

  if (!foundUsers.length) {
    res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
    return;
  }

  res.json(foundUsers);
};
