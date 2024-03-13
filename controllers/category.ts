import { NextFunction, Request, Response } from "express";
import categoryModel from "../models/category";
import { CategoryBody } from "../interfaces/category";
import httpErrors from "http-errors";
import usersModel from "../models/users";
import musicModel from "../models/music";
import albumModel from "../models/album";
import archiveModel from "../models/archive";
import playListModel from "../models/playList";
import upcomingModel from "../models/upcoming";
import singerModel from "../models/singer";
import countryModel from "../models/country";
import { rimrafSync } from "rimraf";
import pagination from "../helpers/pagination";
import path from "path";
import { isValidObjectId } from "mongoose";

export let create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { collaborators, title, country } = req.body as CategoryBody;
    const { user } = req as any;

    const existingCategory = await categoryModel.findOne({ title, country });

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
    const query = categoryModel.find().lean();

    const data = await pagination(req, query, categoryModel);

    if (data.error) throw data.error;

    res.json(data);
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

    if (String(category.createBy) !== String(user._id) && !user.isSuperAdmin) {
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

    if (body.type !== category.type) {
      throw httpErrors.BadRequest(
        "The type field cannot be updated. Submit the previous type"
      );
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

    if (String(category.createBy) !== String(user._id) && !user.isSuperAdmin) {
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
export let getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("This category id is not form mongodb");
    }

    const category = await categoryModel.findById(id).lean();

    if (!category) {
      throw httpErrors.NotFound("Category not found");
    }

    res.json(category);
  } catch (error) {
    next(error);
  }
};
export let search = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category } = req.query;

    if (!category) throw httpErrors.BadRequest("Category is required");

    const query = categoryModel
      .find({
        title: { $regex: category },
      })
      .lean();

    const data = await pagination(req, query, categoryModel);

    res.json(data);
  } catch (error) {
    next(error);
  }
};
export let addToCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = req as any;
    const { id } = req.params;
    const { targetId, type } = req.body;

    if (!type) throw httpErrors.BadRequest("Type is required");

    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("This category id is not from mongodb");
    }

    if (!isValidObjectId(targetId)) {
      throw httpErrors.BadRequest("This targetId is not from mongodb");
    }

    const models: any = {
      music: musicModel,
      album: albumModel,
      archive: archiveModel,
      upcoming: upcomingModel,
      playList: playListModel,
      singer: singerModel,
    };

    if (!models[type]) {
      throw httpErrors.BadRequest(`type ${type} is not valid`);
    }

    const existingTargetId = await models[type].findById(targetId).populate({
      path: "artist",
      select: "country",
      strictPopulate: false,
    });

    if (!existingTargetId) {
      throw httpErrors.NotFound(`${type} not found`);
    }

    const category = await categoryModel.findById(id);

    if (!category) throw httpErrors.NotFound("Category not found");

    if (type !== category.type) {
      throw httpErrors.BadRequest(
        `${type} cannot be added to a category by type ${category.type}`
      );
    }

    const { accessLevel, createBy, collaborators } = category;
    if (!user.isSuperAdmin)
      if (
        accessLevel == "private" &&
        String(createBy._id) !== String(user._id)
      ) {
        throw httpErrors.Forbidden(
          "You do not have permission to access this category"
        );
      } else if (
        accessLevel == "selectedCollaborators" &&
        String(createBy._id) !== String(user._id)
      ) {
        const foundCollaborators = collaborators.some(
          (item) => String(item._id) == String(user._id)
        );

        if (!foundCollaborators)
          throw httpErrors.Forbidden("You are not listed among the colleagues");
      }

    const foundTargetIds = category.target_ids.some(
      (item) => String(item._id) == targetId
    );

    if (foundTargetIds) {
      throw httpErrors.Conflict(`This ${type} already exists`);
    }
    const targetIdCountry =
      existingTargetId.country ?? existingTargetId?.artist?.country;

    if (String(category.country._id) !== String(targetIdCountry)) {
      throw httpErrors.BadRequest(
        `${type} from other countries cannot be added to the category`
      );
    }

    await categoryModel.findByIdAndUpdate(id, {
      $push: {
        target_ids: targetId,
      },
    });

    res.json({ message: "Added to category successfully" });
  } catch (error) {
    next(error);
  }
};
export let removeFromCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user } = req as any;
    const { id } = req.params;
    const { targetId } = req.body;

    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("This category id is not from mongodb");
    }

    if (!isValidObjectId(targetId)) {
      throw httpErrors.BadRequest("This targetId is not from mongodb");
    }

    const category = await categoryModel.findById(id);
    if (!category) throw httpErrors.NotFound("Category not found");
    const foundTargetIds = category.target_ids.some(
      (item) => String(item._id) == targetId
    );

    if (!foundTargetIds) {
      throw httpErrors.BadRequest(
        `${category.type} was not found in the category`
      );
    }
    const { accessLevel, collaborators, createBy, type } = category;
    if (!user.isSuperAdmin)
      if (accessLevel == "private" && String(createBy) !== String(user._id)) {
        throw httpErrors.Forbidden(
          "You do not have permission to access this category"
        );
      } else if (
        accessLevel == "selectedCollaborators" &&
        String(createBy) !== String(user._id)
      ) {
        const foundCollaborators = collaborators.some(
          (item) => String(item._id) == String(user._id)
        );

        if (!foundCollaborators)
          throw httpErrors.Forbidden("You are not listed among the colleagues");
      }

    await category.updateOne({
      $pull: {
        target_ids: targetId,
      },
    });
    res.json({ message: `Deleted ${type} from category successfully` });
  } catch (error) {
    next(error);
  }
};
export let like = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { user } = req as any;
    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("Category id is not from mongodb");
    }

    const category = await categoryModel.findById(id);

    if (!category) {
      throw httpErrors.NotFound("Category not found");
    }

    const likes = category.likes.map((like) => String(like._id));

    if (likes.includes(String(user._id))) {
      throw httpErrors.Conflict("You have already liked");
    }

    await categoryModel.findByIdAndUpdate(id, {
      $addToSet: { likes: user._id },
    });

    res.json({ message: "Liked category successfully" });
  } catch (error) {
    next(error);
  }
};
export let unlike = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { user } = req as any;
    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("category id is not from mongodb");
    }

    const category = await categoryModel.findById(id);

    if (!category) {
      throw httpErrors.NotFound("category not found");
    }

    const likes = category.likes.map((like) => String(like._id));

    if (!likes.includes(String(user._id))) {
      throw httpErrors.Conflict("You have not liked the category");
    }

    await categoryModel.findByIdAndUpdate(id, {
      $pull: { likes: user._id },
    });

    res.json({ message: "The category was successfully unliked" });
  } catch (error) {
    next(error);
  }
};
export let popular = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = categoryModel.find();

    const data = await pagination(req, query, categoryModel);

    if (data.error) throw data.error;

    const resultSort = data.data.sort(
      (a: any, b: any) => b.likes.length - a.likes.length
    );

    res.json({ ...data, data: resultSort });
  } catch (error) {
    next(error);
  }
};
export let related = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      throw httpErrors.BadRequest("This category id is not from mongodb");
    }

    const category = await categoryModel.findById(id);

    if (!category) {
      throw httpErrors.NotFound("Category not found");
    }

    const relatedCategories = await categoryModel
      .find({ country: category.country, _id: { $ne: id } })
      .limit(10);

    res.json(relatedCategories);
  } catch (error) {
    next(error);
  }
};
export let getByCountry = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { countryId } = req.params;

    if (!isValidObjectId(countryId)) {
      throw httpErrors.BadRequest("This country id is not form mongodb");
    }

    const country = await countryModel.findById(countryId);

    if (!country) {
      throw httpErrors.NotFound("Country not found");
    }

    const query = categoryModel.find({ country: country._id });

    const data = await pagination(req, query, categoryModel);

    res.json(data);
  } catch (error) {
    next(error);
  }
};
