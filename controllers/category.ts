import express from "express";
import { BodyCategory } from "../interfaces/category";
import categoryModel from "../models/category";
import httpStatus from "http-status";
import { isValidObjectId } from "mongoose";

export let getAll = async (req: express.Request, res: express.Response) => {
  const categories = await categoryModel
    .find()
    .populate("categoryParent", "-__v")
    .lean()
    .select("-__v");
  const filterCategories: any = [];

  categories.forEach((category) => {
    if (category.parent) {
      const { parent, ...newCategory } = category;
      filterCategories.push(newCategory);
    }
  });
  res.json(filterCategories);
};

export let getAllParents = async (
  req: express.Request,
  res: express.Response
) => {
  const categories = (await categoryModel.find().select("-__v ")).filter(
    (category) => !category.parent
  );
  res.json(categories);
};

export let create = async (req: express.Request, res: express.Response) => {
  let { title, description, parent } = req.body as BodyCategory;
  title = title.trim();
  description = description?.trim();
  if (parent && !isValidObjectId(parent)) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "This parent id is not from mongodb" });
    return;
  }

  if (parent) {
    const hasCategoryInDb = await categoryModel.findOne({ _id: parent });

    if (!hasCategoryInDb) {
      res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "Category parent not found" });
      return;
    }
  }

  const category = await categoryModel.findOne({ title }).lean();

  if (category) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "This category already exists" });
    return;
  }

  await categoryModel.create({
    title,
    description,
    parent,
  });

  res
    .status(httpStatus.CREATED)
    .json({ message: "Create new category successfully" });
};

export let update = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  let { title, description, parent } = req.body as BodyCategory;
  title = title.trim();
  description = description?.trim();

  if (parent && !isValidObjectId(parent)) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "This parent id is not from mongodb" });
    return;
  }

  if (!isValidObjectId(id)) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "This id is not from mongodb" });
    return;
  }
  const hasCategoryInDb = await categoryModel.findOne({ _id: id });

  if (!hasCategoryInDb) {
    res.status(httpStatus.NOT_FOUND).json({ message: "Category not found" });
    return;
  }

  await categoryModel.updateOne(
    { _id: id },
    {
      title,
      description,
      parent,
    }
  );

  res.json({ message: "Update Category successfully" });
};

export let remove = async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "This parent id is not from mongodb" });
    return;
  }
  const hasCategoryInDb = await categoryModel.findOne({ _id: id });

  if (!hasCategoryInDb) {
    res.status(httpStatus.NOT_FOUND).json({ message: "Category not found" });
    return;
  }

  await categoryModel.deleteOne({ _id: id });
  res.json({ message: "Deleted category successfully" });
};
