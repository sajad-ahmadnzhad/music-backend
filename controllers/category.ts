import { NextFunction, Request, Response } from "express";
import categoryModel from "../models/category";
import { CategoryBody } from "../interfaces/category";
import httpErrors from "http-errors";
import usersModel from "../models/users";

export let create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accessLevel, collaborators } = req.body as CategoryBody;

    const { user } = req as any;
    if (accessLevel == "selectedCollaborators" && !collaborators?.length) {
      throw httpErrors.BadRequest("No admin has been selected");
    } else if (
      accessLevel !== "selectedCollaborators" &&
      collaborators?.length
    ) {
      throw httpErrors.BadRequest("The collaborators field is not allowed");
    }

    if (collaborators?.length) {
      const existingAdmin = await usersModel.findOne({
        _id: { $in: collaborators },
      });

      if (String(existingAdmin!._id) === String(user._id)) {
        throw httpErrors.BadRequest("You cannot choose yourself as colleagues");
      }
    }

    await categoryModel.create({
      ...req.body,
      image: req.file && `/categoryImages/${req.file.filename}`,
      createBy: user._id,
    });

    res.json({ message: "Create category successfully" });
  } catch (error) {
    next(error);
  }
};

export let getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allCategories = await categoryModel
      .find()
      .populate("createBy", "name username profile")
      .populate("collaborators", "name username profile")
      .populate("genre", "title description")
      .select("-__v")
      .lean();
    res.json(allCategories);
  } catch (error) {
    next(error);
  }
};
