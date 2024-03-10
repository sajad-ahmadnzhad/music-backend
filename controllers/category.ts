import { NextFunction, Request, Response } from "express";
import categoryModel from "../models/category";
import { CategoryBody } from "../interfaces/category";
import httpErrors from "http-errors";
import usersModel from "../models/users";
import { rimrafSync } from "rimraf";
import path from "path";
import { isValidObjectId } from "mongoose";

export let create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { collaborators, title } = req.body as CategoryBody;
    const { user } = req as any;

    const existingCategory = await categoryModel.findOne({ title });

    if (existingCategory) throw httpErrors.Conflict("Category already exists");

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
      .populate("country", "title description image")
      .select("-__v")
      .lean();
    res.json(allCategories);
  } catch (error) {
    next(error);
  }
};
export let update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as CategoryBody;
    const { id } = req.params;
    const { user } = req as any;

    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("This category id is not form mongodb");
    }

    const category = await categoryModel.findById(id);

    if (!category) {
      throw httpErrors.NotFound("Category not found");
    }

    if (String(category.createBy) !== user._id && !user.isSuperAdmin) {
      throw httpErrors.Forbidden(
        "This category can only be edited by the person who created it"
      );
    }

    if (body.collaborators?.length) {
      const existingAdmin = await usersModel.findOne({
        _id: { $in: body.collaborators },
      });

      if (String(existingAdmin!._id) === String(user._id)) {
        throw httpErrors.BadRequest("You cannot choose yourself as colleagues");
      }
    }

    const existingCategory = await categoryModel.findOne({
      title: body.title,
    });
    if (existingCategory && String(existingCategory._id) !== id) {
      throw httpErrors.Conflict("Category with this name already exists");
    }

    if (req.file && category.image) {
      rimrafSync(path.join(process.cwd(), "public", category.image));
    }

    await categoryModel.findOneAndUpdate(
      { _id: id },
      {
        ...body,
        image: req.file && `/categoryImages/${req.file.filename}`,
      }
    );

    res.json({ message: "Updated category successfully" });
  } catch (error) {
    next(error);
  }
};
export let remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { user } = req as any;

    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("This category id is not form mongodb");
    }

    const category = await categoryModel.findById(id);

    if (!category) {
      throw httpErrors.NotFound("Category not found");
    }

    if (String(category.createBy) !== user._id && !user.isSuperAdmin) {
      throw httpErrors.Forbidden(
        "This category can only be removed by the person who created it"
      );
    }

    await categoryModel.deleteOne({ _id: id });

    res.json({ message: "Deleted category successfully" });
  } catch (error) {
    next(error);
  }
};
