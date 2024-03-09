import { NextFunction, Request, Response } from "express";
import categoryModel from "../models/category";
export let getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(req.body)
    const allCategories = await categoryModel.find().lean();
    res.json(allCategories);
  } catch (error) {
    next(error);
  }
};
