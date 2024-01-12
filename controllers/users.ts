import express from "express";
import usersModel from "../models/users";
import banUserModel from "../models/banUser";
import { isValidObjectId } from "mongoose";
import httpStatus from "http-status";
import { RegisterBody } from "./../interfaces/auth";
import bcrypt from "bcrypt";

export let getAll = async (req: express.Request, res: express.Response) => {
  const users = await usersModel.find({}).lean().select("-password -_id -__v");
  res.json(users);
};

export let changeRole = async (req: express.Request, res: express.Response) => {
  const id = req.params.id;
  if (!isValidObjectId(id)) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "This id is not from mongodb" });
    return;
  }
  const user = await usersModel.findById(id);

  if (!user) {
    res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
    return;
  }
  if (user.isSuperAdmin) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "You cannot change the super admin role" });
    return;
  }

  const changedRole = await usersModel.findOneAndUpdate(
    { _id: user._id },
    { isAdmin: user.isAdmin ? false : true },
    { new: true }
  );
  res.json({
    message: `Role changed to ${
      changedRole!.isAdmin ? "admin" : "user"
    } successfully`,
  });
};

export let ban = async (req: express.Request, res: express.Response) => {
  const admin = (req as any).user;
  const id = req.params.id;
  if (!isValidObjectId(id)) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "This id is not from mongodb" });
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
        message:
          "You cannot ban an admin, this feature is only available for super admin.",
      });
      return;
    }
  }

  if (user.isSuperAdmin) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "You cannot ban a super admin" });
    return;
  }

  const banUser = await banUserModel.findOne({ email: user.email });

  if (banUser) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "This user has already been blocked" });
    return;
  }

  await banUserModel.create({ email: user.email });
  res.json({ message: "The user was successfully banned" });
};

export let unban = async (req: express.Request, res: express.Response) => {
  const id = req.params.id;
  if (!isValidObjectId(id)) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "This id is not from mongodb" });
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
      message:
        "This person is banned by super admin and only super admin can unban her",
    });
    return;
  }

  const unBanUser = await banUserModel.findOneAndDelete({ _id: id });

  res.json({
    message: `User ${
      unBanUser!.email
    } has been successfully removed from the banned list`,
  });
};

export let getAllBan = async (req: express.Request, res: express.Response) => {
  const usersBlocked = await banUserModel.find().select("-__v");
  res.json(usersBlocked);
};

export let remove = async (req: express.Request, res: express.Response) => {
  const id = req.params.id;
  const admin = (req as any).user;

  if (!isValidObjectId(id)) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "This id is not from mongodb" });
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
        message:
          "You cannot remove an admin, this feature is only available for super admin.",
      });

      return;
    }
  }

  if (user.isSuperAdmin) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "You cannot remove a super admin" });
    return;
  }

  await usersModel.deleteOne({ _id: id });

  res.json({
    message: `User ${user.email} has been successfully removed from the user list`,
  });
};

export let update = async (req: express.Request, res: express.Response) => {
  let { name, username, email, password } = req.body as RegisterBody;
  name = name.trim();
  username = username.trim();
  email = email.trim();
  password = password.trim();
  const { _id } = (req as any).user;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const updatedUser = await usersModel
    .findOneAndUpdate(
      { _id },
      {
        name,
        username,
        email,
        password: hashedPassword,
      },
      { new: true }
    )
    .select("-password");
  res.json({ message: "user updated successfully", updatedUser });
};
