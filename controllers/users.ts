import { NextFunction, Request, Response } from "express";
import usersModel from "../models/users";
import banUserModel from "../models/banUser";
import { isValidObjectId } from "mongoose";
import { RegisterBody } from "./../interfaces/auth";
import bcrypt from "bcrypt";
import pagination from "../helpers/pagination";
import path from "path";
import fs from "fs";
import httpErrors from "http-errors";

export let myAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = req as any;
    res.json(user);
  } catch (error) {
    next(error);
  }
};
export let getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let query = usersModel
      .find()
      .sort({ createdAt: "desc" })
      .select("-password -__v");

    const data = await pagination(req, query, usersModel);

    if (data.error) {
      throw httpErrors(data?.error?.status || 400, data.error?.message || "");
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};
export let changeRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;

    if (!isValidObjectId(id))
      throw httpErrors.BadRequest("This id is not from mongodb");

    const user = await usersModel.findById(id);

    if (!user) throw httpErrors.NotFound("User not found");

    if (user.isSuperAdmin)
      throw httpErrors.BadRequest("You cannot change the super admin role");

    const changedRole = await usersModel.findOneAndUpdate(
      { _id: user._id },
      { isAdmin: !user.isAdmin },
      { new: true }
    );
    res.json({
      message: `Role changed to ${
        changedRole!.isAdmin ? "admin" : "user"
      } successfully`,
    });
  } catch (error) {
    next(error);
  }
};
export let ban = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = (req as any).user;
    const id = req.params.id;

    if (!isValidObjectId(id))
      throw httpErrors.BadRequest("This id is not from mongodb");

    const user = await usersModel.findOne({ _id: id });
    if (!user) throw httpErrors.NotFound("User not found");

    if (user.isAdmin && !admin.isSuperAdmin)
      throw httpErrors.BadRequest(
        "You cannot ban an admin, this feature is only available for super admin."
      );

    if (user.isSuperAdmin)
      throw httpErrors.BadRequest("You cannot ban a super admin");

    const banUser = await banUserModel.findOne({ email: user.email });

    if (banUser)
      throw httpErrors.Conflict("This user has already been blocked");

    await banUserModel.create({ email: user.email });
    res.json({ message: "The user was successfully banned" });
  } catch (error) {
    next(error);
  }
};
export let unban = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("This id is not from mongodb");
    }
    const user = await banUserModel.findById(id);
    if (!user) {
      throw httpErrors.NotFound("User not found");
    }

    const isUserAdmin = await usersModel.findOne({ email: user.email })!;

    if (isUserAdmin!.isAdmin && !(req as any).user.isSuperAdmin) {
      throw httpErrors.BadRequest(
        "This person is banned by super admin and only super admin can unban her"
      );
    }

    await banUserModel.findOneAndDelete({ _id: id });

    res.json({
      message: `The user has been successfully removed from the banned list`,
    });
  } catch (error) {
    next(error);
  }
};
export let getAllBan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const usersBanned = await banUserModel.find().select("-__v");
    res.json(usersBanned);
  } catch (error) {
    next(error);
  }
};
export let remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const admin = (req as any).user;

    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("This id is not from mongodb");
    }
    const user = await usersModel.findOne({ _id: id });
    if (!user) {
      throw httpErrors.NotFound("User not found");
    }

    if (user.isAdmin && !admin.isSuperAdmin) {
      throw httpErrors.BadRequest(
        "You cannot remove an admin, this feature is only available for super admin."
      );
    }

    if (user.isSuperAdmin) {
      throw httpErrors.BadRequest("You cannot remove a super admin");
    }

    await usersModel.deleteOne({ _id: id });

    res.json({
      message: `The user has been successfully removed from the user list`,
    });
  } catch (error) {
    next(error);
  }
};
export let update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let body = req.body as RegisterBody;
    const { user } = req as any;

    if (req.file && !user.profile?.includes("customProfile")) {
      fs.unlinkSync(path.join(process.cwd(), "public", user.profile));
    }

    const hashedPassword = bcrypt.hashSync(body.password, 10);

    await usersModel
      .findOneAndUpdate(
        { _id: user._id },
        {
          ...body,
          password: hashedPassword,
          profile: req.file && `/usersProfile/${req.file.filename}`,
        }
      )
      .select("-password");
    res.json({ message: "user updated successfully" });
  } catch (error) {
    next(error);
  }
};
export let getAllAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const admins = (await usersModel.find().select("-__v -password")).filter(
      (admin) => admin.isAdmin
    );

    res.json(admins);
  } catch (error) {
    next(error);
  }
};
export let search = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req.query;

    if (!user) {
      throw httpErrors.BadRequest("User is required");
    }

    const foundUsers = await usersModel
      .find({
        $or: [{ name: user }, { username: user }, { email: user }],
      })
      .select("-password");

    res.json(foundUsers);
  } catch (error) {
    next(error);
  }
};
