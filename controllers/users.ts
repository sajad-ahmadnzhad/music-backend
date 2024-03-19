import { NextFunction, Request, Response } from "express";
import usersModel from "../models/users";
import banUserModel from "../models/banUser";
import { isValidObjectId } from "mongoose";
import { RegisterBody } from "./../interfaces/auth";
import bcrypt from "bcrypt";
import pagination from "../helpers/pagination";
import path from "path";
import { rimrafSync } from "rimraf";
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
      .find({ isVerified: true })
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

    const foundUser = await usersModel.findOne({
      $or: [
        { email: body.email, _id: { $ne: user._id } },
        { username: body.username, _id: { $ne: user._id } },
      ],
    });

    if (foundUser) {
      throw httpErrors.Conflict("Username or email already exists");
    }

    if (user.email !== body.email) {
      await usersModel.findByIdAndUpdate(user._id, { isVerified: false });
      res.clearCookie("token");
    }

    if (req.file && !user.profile?.includes("customProfile")) {
      rimrafSync(path.join(process.cwd(), "public", user.profile));
    }

    const hashedPassword = bcrypt.hashSync(body.password, 10);

    await usersModel.updateOne(
      { _id: user._id },
      {
        ...body,
        password: hashedPassword,
        profile: req.file && `/usersProfile/${req.file.filename}`,
      }
    );

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
export let getUnverified = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let query = usersModel
      .find({ isVerified: false })
      .sort({ createdAt: "desc" })
      .select("-password -__v");

    const data = await pagination(req, query, usersModel);

    if (data.error) throw data.error;

    res.json(data);
  } catch (error) {
    next(error);
  }
};
export let deleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = req as any;
    const body = req.body;

    if (user.isSuperAdmin) {
      throw httpErrors.BadRequest(
        "To delete your account, transfer ownership first"
      );
    }

    if (!body.password) {
      throw httpErrors.BadRequest("Password is required");
    }

    const foundUser = await usersModel.findById(user._id);

    const comparePassword = bcrypt.compareSync(
      body.password,
      foundUser!.password
    );

    if (!comparePassword) {
      throw httpErrors.BadRequest("Password is not valid");
    }

    await foundUser!.deleteOne();
    res.clearCookie("token");
    res.json({ message: "Deleted account successfully" });
  } catch (error) {
    next(error);
  }
};
export let changeSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { user } = req as any;
    const { password } = req.body;

    if (!isValidObjectId(userId))
      throw httpErrors.BadRequest("This user id is not from mongodb");

    const existingUser = await usersModel.findById(userId);

    if (!existingUser) throw httpErrors.NotFound("User not found");

    if (userId == String(user._id)) {
      throw httpErrors.BadRequest("The entered user id is super admin");
    }

    if (!password) {
      throw httpErrors.BadRequest("Password is required");
    }

    if (!existingUser.isVerified) {
      throw httpErrors.BadRequest(
        "The logged in user has yet to confirm her email"
      );
    }

    const foundSuperAdmin = await usersModel.findById(user._id);

    const comparPassword = bcrypt.compareSync(
      password,
      foundSuperAdmin!.password
    );

    if (!comparPassword) {
      throw httpErrors.BadRequest("Password is not valid");
    }

    await existingUser.updateOne({
      isAdmin: true,
      isSuperAdmin: true,
    });

    await foundSuperAdmin!.updateOne({
      isSuperAdmin: false,
    });

    res.json({ message: "Super admin transferred successfully" });
  } catch (error) {
    next(error);
  }
};
export let validation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let body = req.body as RegisterBody;
    const { user } = req as any;

    const foundUser = await usersModel.findOne({
      $or: [
        { email: body.email, _id: { $ne: user._id } },
        { username: body.username, _id: { $ne: user._id } },
      ],
    });

    if (foundUser) {
      throw httpErrors.Conflict("Username or email already exists");
    }

    res.json({message: 'Validation was successful'})
  } catch (error) {
    next(error);
  }
};
