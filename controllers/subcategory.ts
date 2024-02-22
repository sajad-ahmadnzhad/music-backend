import { NextFunction, Request, Response } from "express";
import { SubCategoryBody } from "../interfaces/subcategory";
import httpStatus from "http-status";
import httpErrors from "http-errors";
import { isValidObjectId } from "mongoose";
import subcategoryModel from "../models/subcategory";
export let create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as SubCategoryBody;
    const { user } = req as any;

    const subcategory = await subcategoryModel.findOne({ title: body.title });

    if (subcategory) {
      throw httpErrors.Conflict("This subcategory already exists");
    }

    await subcategoryModel.create({ ...body, createBy: user._id });

    res
      .status(httpStatus.CREATED)
      .json({ message: "Create subcategory successfully" });
  } catch (error) {
    next(error);
  }
};
export let getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subcategories = await subcategoryModel
      .find()
      .populate("createBy", "name username profile")
      .select("-__v")
      .lean();
    res.json(subcategories);
  } catch (error) {
    next(error);
  }
};
export let update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { user } = req as any;
    const body = req.body as SubCategoryBody;
    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("subcategory id is not from mongodb");
    }

    const subcategory = await subcategoryModel.findById(id).lean();

    if (!subcategory) {
      throw httpErrors.NotFound("subcategory not found");
    }

    const foundByTitleSubcategory = await subcategoryModel.findOne({
      title: body.title,
    });

    if (foundByTitleSubcategory) {
      throw httpErrors.Conflict("This subcategory already exists");
    }

    if (subcategory.createBy !== user._id && !user.isSuperAdmin) {
      throw httpErrors.BadRequest(
        "This subcategory can only be edited by the person who created it"
      );
    }
    await subcategoryModel.findByIdAndUpdate(id, body);

    res.json({ message: "updated subcategory successfully" });
  } catch (error) {
    next(error);
  }
};
export let remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { user } = req as any;
    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("subcategory id is not from mongodb");
    }

    const subcategory = await subcategoryModel
      .findById(id)
      .select("-__v")
      .lean();

    if (!subcategory) {
      throw httpErrors.NotFound("subcategory not found");
    }

    if (subcategory.createBy !== user._id && !user.isSuperAdmin) {
      throw httpErrors.BadRequest(
        "This subcategory can only be deleted by the person who created it"
      );
    }

    await subcategoryModel.findByIdAndDelete(id);

    res.json({ message: "Deleted subcategory successfully" });
  } catch (error) {
    next(error);
  }
};
export let getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("subcategory id is not from mongodb");
    }
    const subcategory = await subcategoryModel
      .findById(id)
      .populate("createBy", "name username profile")
      .select("-__v")
      .lean();

    if (!subcategory) {
      throw httpErrors.NotFound("subcategory not found");
    }
    res.json(subcategory);
  } catch (error) {
    next(error);
  }
};
