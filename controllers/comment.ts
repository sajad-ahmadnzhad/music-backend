import { Request, Response, NextFunction } from "express";
import { CommentsBody } from "../interfaces/comment";
import commentModel from "../models/comment";
import httpStatus from "http-status";
import musicModel from "../models/music";
import pagination from "../helpers/pagination";
import { isValidObjectId } from "mongoose";
import httpErrors from "http-errors";
export let create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { musicId } = req.params;
    const body = req.body as CommentsBody;
    const { user } = req as any;
    if (!isValidObjectId(musicId)) {
      throw httpErrors.BadRequest("music id is not from mongodb");
    }

    const music = await musicModel.findById(musicId).lean();

    if (!music) {
      throw httpErrors.NotFound("Music not found");
    }

    await commentModel.create({ ...body, creator: user._id, musicId });

    res
      .status(httpStatus.CREATED)
      .json({ message: "Create comment successfully" });
  } catch (error) {
    next(error);
  }
};
export let getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { musicId } = req.params;

    if (!isValidObjectId(musicId)) {
      throw httpErrors.BadRequest("music id is not from mongodb");
    }

    const music = await musicModel.findById(musicId).lean();

    if (!music) {
      throw httpErrors.NotFound("Music not found");
    }

    const query = commentModel
      .find({ musicId })
      .select("-__v")
      .sort({ createdAt: "desc" })
      .populate("creator", "name username profile")
      .populate({
        path: "musicId",
        select: "title artist cover_image download_link",
        populate: [{ path: "artist", select: "fullName photo" }],
      })
      .lean();

    const data = await pagination(req, query, commentModel);

    if (data.error) {
      throw httpErrors(data?.error?.status || 400, data.error?.message || "");
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};
export let reply = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { commentId, musicId } = req.params;
    const { body } = req.body;
    const { user } = req as any;

    if (!body || body > 3) {
      throw httpErrors.BadRequest(
        "The body is mandatory and requires at least 3 characters"
      );
    }

    if (!isValidObjectId(commentId)) {
      throw httpErrors.BadRequest("Comment id is not from mongodb");
    }

    const comment = await commentModel.findById(commentId).lean();

    if (!comment) {
      throw httpErrors.NotFound("Comment not found");
    }

    if (!isValidObjectId(musicId)) {
      throw httpErrors.BadRequest("Music id is not from mongodb");
    }

    const music = await musicModel.findById(musicId).lean();

    if (!music) {
      throw httpErrors.NotFound("Music not found");
    }

    const replay = await commentModel.create({
      creator: user._id,
      body: body?.trim(),
      musicId,
      parentComment: commentId,
    });

    await commentModel.findOneAndUpdate(
      { _id: commentId, musicId },
      { $push: { replies: replay._id } }
    );

    res.json({ message: "Reply to comment successfully" });
  } catch (error) {
    next(error);
  }
};
export let remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { commentId } = req.params;
    const { user } = req as any;
    if (!isValidObjectId(commentId)) {
      throw httpErrors.BadRequest("Comment id is not from mongodb");
    }

    const comment = await commentModel.findById(commentId).lean();

    if (!comment) {
      throw httpErrors.NotFound("Comment not found");
    }

    if (user._id !== comment.creator.toString() && !user.isAdmin) {
      throw httpErrors.BadRequest(
        "This comment can only be deleted by the person who created it"
      );
    }

    await commentModel.deleteMany({ _id: { $in: comment.replies } });
    await commentModel.deleteOne({ _id: commentId });

    res.json({ message: "Deleted comment successfully" });
  } catch (error) {
    next(error);
  }
};
export let update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { commentId } = req.params;
    const { user } = req as any;
    const body = req.body as CommentsBody;

    if (!isValidObjectId(commentId)) {
      throw httpErrors.BadRequest("Comment id is not from mongodb");
    }

    const comment = await commentModel.findById(commentId).lean();

    if (!comment) {
      throw httpErrors.NotFound("Comment not found");
    }

    if (user._id !== comment.creator.toString() && !user.isAdmin) {
      throw httpErrors.BadRequest(
        "This comment can only be changed by the person who created it"
      );
    }

    await commentModel.findByIdAndUpdate(commentId, { ...body, edited: true });

    res.json({ message: "Comment updated successfully" });
  } catch (error) {
    next(error);
  }
};
export let report = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { commentId } = req.params;
    const { user } = req as any;
    if (!isValidObjectId(commentId)) {
      throw httpErrors.BadRequest("Comment id is not from mongodb");
    }

    const comment = await commentModel.findById(commentId).lean();

    if (!comment) {
      throw httpErrors.NotFound("Comment not found");
    }

    const isReported = !!(await commentModel.findOne({
      _id: commentId,
      reports: { $in: [user._id] },
    }));

    if (isReported) {
      throw httpErrors.Conflict("You have already reported");
    }

    await commentModel.findByIdAndUpdate(commentId, {
      $addToSet: { reports: user._id },
    });

    res.json({ message: "Comment reported successfully" });
  } catch (error) {
    next(error);
  }
};
export let unReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { commentId } = req.params;
    const { user } = req as any;
    if (!isValidObjectId(commentId)) {
      throw httpErrors.BadRequest("Comment id is not from mongodb");
    }

    const comment = await commentModel.findById(commentId).lean();

    if (!comment) {
      throw httpErrors.NotFound("Comment not found");
    }

    const isReported = !!(await commentModel.findOne({
      _id: commentId,
      reports: { $in: [user._id] },
    }));

    if (!isReported) {
      throw httpErrors.BadRequest("You have not already reported this comment");
    }

    await commentModel.findByIdAndUpdate(commentId, {
      $pull: { reports: user._id },
    });

    res.json({ message: "The report was canceled successfully" });
  } catch (error) {
    next(error);
  }
};
export let like = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { commentId } = req.params;
    const { user } = req as any;
    if (!isValidObjectId(commentId)) {
      throw httpErrors.BadRequest("Comment id is not from mongodb");
    }

    const comment = await commentModel.findById(commentId).lean();

    if (!comment) {
      throw httpErrors.NotFound("Comment not found");
    }

    const isLiked = !!(await commentModel.findOne({
      _id: commentId,
      like: { $in: [user._id] },
    }));

    if (isLiked) {
      throw httpErrors.Conflict("You have already liked");
    }

    const isDisliked = !!(await commentModel.findOne({
      _id: commentId,
      dislike: { $in: [user._id] },
    }));

    if (isDisliked) {
      throw httpErrors.Conflict("You have disliked this comment");
    }

    await commentModel.findByIdAndUpdate(commentId, {
      $addToSet: { like: user._id },
    });

    res.json({ message: "Comment liked successfully" });
  } catch (error) {
    next(error);
  }
};
export let unlike = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { commentId } = req.params;
    const { user } = req as any;
    if (!isValidObjectId(commentId)) {
      throw httpErrors.BadRequest("Comment id is not from mongodb");
    }

    const comment = await commentModel.findById(commentId).lean();

    if (!comment) {
      throw httpErrors.NotFound("Comment not found");
    }

    const isLiked = !!(await commentModel.findOne({
      _id: commentId,
      like: { $in: [user._id] },
    }));

    if (!isLiked) {
      throw httpErrors.Conflict("You have not already liked this comment");
    }

    await commentModel.findByIdAndUpdate(commentId, {
      $pull: { like: user._id },
    });

    res.json({ message: "The like was canceled successfully" });
  } catch (error) {
    next(error);
  }
};
export let dislike = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { commentId } = req.params;
    const { user } = req as any;
    if (!isValidObjectId(commentId)) {
      throw httpErrors.BadRequest("Comment id is not from mongodb");
    }

    const comment = await commentModel.findById(commentId).lean();

    if (!comment) {
      throw httpErrors.NotFound("Comment not found");
    }

    const isDisliked = !!(await commentModel.findOne({
      _id: commentId,
      dislike: { $in: [user._id] },
    }));

    if (isDisliked) {
      throw httpErrors.Conflict("You have not already disliked this comment");
    }

    const isLiked = !!(await commentModel.findOne({
      _id: commentId,
      like: { $in: [user._id] },
    }));

    if (isLiked) {
      throw httpErrors.Conflict("You have liked this comment");
    }

    await commentModel.findByIdAndUpdate(commentId, {
      $addToSet: { dislike: user._id },
    });

    res.json({ message: "Dislike successfully canceled" });
  } catch (error) {
    next(error);
  }
};
export let unDislike = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { commentId } = req.params;
    const { user } = req as any;
    if (!isValidObjectId(commentId)) {
      throw httpErrors.BadRequest("Comment id is not from mongodb");
    }

    const comment = await commentModel.findById(commentId).lean();

    if (!comment) {
      throw httpErrors.NotFound("Comment not found");
    }

    const isDisliked = !!(await commentModel.findOne({
      _id: commentId,
      dislike: { $in: [user._id] },
    }));

    if (!isDisliked) {
      throw httpErrors.Conflict("You have not already disliked this comment");
    }

    await commentModel.findByIdAndUpdate(commentId, {
      $pull: { dislike: user._id },
    });

    res.json({ message: "Un dislike successfully canceled" });
  } catch (error) {
    next(error);
  }
};
export let allReports = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { musicId } = req.params;
    const { user } = req as any;
    if (!isValidObjectId(musicId)) {
      throw httpErrors.BadRequest("Music id is not from mongodb");
    }

    const music = await musicModel.findById(musicId).lean();

    if (!music) {
      throw httpErrors.NotFound("Music not found");
    }

    if (String(user._id) !== String(music.createBy) && !user.isSupperAdmin) {
      throw httpErrors.Forbidden(
        "Only the admin who created this music can receive reports"
      );
    }

    const comments = (await commentModel.find({ musicId })).filter(
      (comment) => comment.reports.length >= 3
    );

    res.json(comments);
  } catch (error) {
    next(error);
  }
};
