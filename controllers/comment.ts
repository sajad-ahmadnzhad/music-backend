import { Request, Response, NextFunction } from "express";
import { CommentsBody } from "../interfaces/comment";
import commentModel from "../models/comment";
import httpStatus from "http-status";
import pagination from "../helpers/pagination";
import { isValidObjectId } from "mongoose";
import httpErrors from "http-errors";
export let create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as CommentsBody;
    const { user } = req as any;

    if (!body.body) {
      throw httpErrors.BadRequest("Body is required");
    }

    await commentModel.create({
      ...body,
      creator: user._id,
      target_id: body.targetId,
      commentType: body.type,
    });

    res
      .status(httpStatus.CREATED)
      .json({ message: "Create comment successfully" });
  } catch (error) {
    next(error);
  }
};
export let getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, targetId } = req.body;

    const query = commentModel
      .find({ target_id: targetId, commentType: type })
      .select("-__v")
      .sort({ createdAt: "desc" })
      .populate("creator", "name username profile")
      .populate("like", "name username profile")
      .populate("dislike", "name username profile")
      .populate("reports", "name username profile")
      .populate({
        path: "parentComment",
        select: "body creator",
        populate: { path: "creator", select: "name username profile" },
      })
      .populate({
        path: "replies",
        select: "body creator",
        populate: { path: "creator", select: "name username profile" },
      })
      .populate({
        path: "target_id",
        select: "title artist cover_image download_link photo",
        populate: [
          { path: "artist", select: "fullName photo", strictPopulate: false },
        ],
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
    const { commentId } = req.params;
    const { body, type, targetId } = req.body;
    const { user } = req as any;

    if (!body) {
      throw httpErrors.BadRequest("Body is required");
    }

    if (!isValidObjectId(commentId)) {
      throw httpErrors.BadRequest("Comment id is not from mongodb");
    }

    const comment = await commentModel.findById(commentId).lean();

    if (!comment) {
      throw httpErrors.NotFound("Comment not found");
    }

    const replay = await commentModel.create({
      creator: user._id,
      body: body?.trim(),
      parentComment: commentId,
      commentType: type,
      target_id: targetId,
    });

    await commentModel.findOneAndUpdate(
      { _id: commentId },
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

    const isModifyComment = await commentModel.findByIdAndUpdate(
      commentId,
      {
        ...body,
      },
      { new: true }
    );

    if (isModifyComment!.body !== comment.body) {
      await commentModel.findByIdAndUpdate(commentId, { isEdited: true });
    }

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
    const { targetId, type } = req.body;
    const { user } = req as any;

    const comments = (await commentModel
      .find({
        target_id: targetId,
        commentType: type,
        reports: { $exists: true, $ne: [] },
      })
      .populate("creator", "name username profile")
      .populate("reports", "name username profile")
      .populate({
        path: "target_id",
        select: "title artist cover_image download_link photo",
        populate: [
          { path: "artist", select: "fullName photo", strictPopulate: false },
        ],
      })
      .sort({ isReviewed: 1, createdAt: -1 })
      .select("-like -dislike -replies -parentComment -__v -isEdited")
      .lean()) as any;

    if (
      String(user._id) !== String(comments[0].target_id.createBy) &&
      !user.isSuperAdmin
    ) {
      throw httpErrors.Forbidden(
        `Only the admin who created the ${type} can receive the reports`
      );
    }

    res.json(comments);
  } catch (error) {
    next(error);
  }
};
export let reviewed = async (
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
    const comment = (await commentModel
      .findById(commentId)
      .populate("target_id")) as any;

    if (!comment) {
      throw httpErrors.NotFound("Comment not found");
    }

    if (
      String(user._id) !== String(comment.target_id?.createBy) &&
      !user.isSuperAdmin
    ) {
      throw httpErrors.Forbidden(
        `Only the person who created the ${comment.commentType} can review the comment`
      );
    }

    if (comment.isReviewed) {
      throw httpErrors.Conflict("This comment has already been reviewed");
    }

    await commentModel.findByIdAndUpdate(commentId, {
      isReviewed: true,
    });

    res.json({ message: "Reviewed comment successfully" });
  } catch (error) {
    next(error);
  }
};
