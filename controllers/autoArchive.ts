import { Request, Response, NextFunction } from "express";
import pagination from "../helpers/pagination";
import autoArchiveModel from "../models/autoArchive";

export let getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = autoArchiveModel
      .find()
      .populate({
        path: "target_ids",
        select:
          "title description artist genre cover_image fullName englishName nickname photo musicStyle download_link",
        populate: [
          {
            path: "artist",
            select: "fullName englishName photo musicStyle",
            strictPopulate: false,
            populate: [
              {
                path: "musicStyle",
                select: "title description",
                strictPopulate: false,
              },
            ],
          },
          {
            path: "musicStyle",
            select: "title description",
            strictPopulate: false,
          },
          { path: "genre", select: "title description", strictPopulate: false },
        ],
      })
      .populate("country", "title description image")
      .select("-__v")
      .sort({ createdAt: -1 })
      .lean();

    const data = await pagination(req, query, autoArchiveModel);

    if (data.error) throw data.error;

    res.json(data);
  } catch (error) {
    next(error);
  }
};
