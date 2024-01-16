import express from "express";
import categoryParent from "./../models/categoryParent";
import { BodyCategory, BodyCategoryParent } from "../interfaces/category";
import categoryParentModel from "../models/categoryParent";
import categoryModel from "../models/category";
import httpStatus from "http-status";
import { isValidObjectId } from "mongoose";
//category parent
export let getAllParent = async (
  req: express.Request,
  res: express.Response
) => {
  const categories = await categoryParent.find().lean().select("-__v");
  res.json(categories);
};

export let createParent = async (
  req: express.Request,
  res: express.Response
) => {
  const { title, description } = req.body as BodyCategoryParent;
  const category = await categoryParentModel.findOne({ title }).lean();

  if (category) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "This category already exists" });
    return;
  }

  await categoryParentModel.create({
    title,
    description,
  });

  res
    .status(httpStatus.CREATED)
    .json({ message: "Create new category parent successfully" });
};

export let updateParent = async (
  req: express.Request,
  res: express.Response
) => {
  const { parentId } = req.params;
  const { title, description } = req.body as BodyCategoryParent;
  if (!isValidObjectId(parentId)) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "This id is not from mongodb" });
    return;
  }
  const category = await categoryParentModel.findOne({ _id: parentId });
  if (!category) {
    res.status(httpStatus.NOT_FOUND).json({ message: "Category not found" });
    return;
  }
  const updatedCategory = await categoryParentModel.findOneAndUpdate(
    { _id: parentId },
    { title, description },
    { new: true }
  );

  res.json({ message: "Category updated successfully", updatedCategory });
};

export let removeParent = async (
  req: express.Request,
  res: express.Response
) => {
  const { parentId } = req.params;
  if (!isValidObjectId(parentId)) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "This id is not from mongodb" });
    return;
  }
  const category = await categoryParentModel.findOne({ _id: parentId });
  if (!category) {
    res.status(httpStatus.NOT_FOUND).json({ message: "Category not found" });
    return;
  }

  await categoryParentModel.deleteOne({ _id: parentId });
  res.json({ message: "Deleted category parent successfully" });
};

//category
export let getAll = async (req:express.Request , res:express.Response) => {
  const categories = await categoryModel.find().populate('categoryParent').lean().select('-__v')
  res.json(categories)
}
export let create = async (req:express.Request , res:express.Response) => {
  const { title, description, parent } = req.body as BodyCategory


}
export let update = async (req:express.Request , res:express.Response) => {

}
export let remove = async (req:express.Request , res:express.Response) => {

}

