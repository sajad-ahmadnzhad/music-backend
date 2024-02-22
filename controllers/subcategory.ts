import { NextFunction, Request, Response } from "express";
import { SubCategoryBody } from "../interfaces/subcategory";
import httpStatus from "http-status";
import subcategoryModel from "../models/subcategory";
export let create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as SubCategoryBody;

    await subcategoryModel.create(body);

    res
      .status(httpStatus.CREATED)
      .json({ message: "Create subcategory successfully" });
  } catch (error) {
    next(error);
  }
};
