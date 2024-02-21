import { Model } from "mongoose";
import { Request } from "express";
import httpErrors from "http-errors";
export default async (req: Request, query: any, model: any) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * pageSize;
    const total = await model.countDocuments();
    const pages = Math.ceil(total / pageSize);
    query = query.skip(skip).limit(pageSize);

    if (page > pages) {
      throw httpErrors.NotFound("Page not found");
    }

    const result = await query;

    return {
      count: result.length,
      page,
      pages,
      data: result,
    };
  } catch (error: any) {
    return { error };
  }
};
