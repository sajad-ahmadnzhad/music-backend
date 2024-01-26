import express from "express";
import { UserFavoriteBody } from "../interfaces/userFavorite";
import userFavoriteModel from "../models/userFavorite";
import httpStatus from "http-status";
export let create = async (req: express.Request, res: express.Response) => {
  const { type, target_id } = req.body as UserFavoriteBody;
    const { user } = req as any;
    
    await userFavoriteModel.create({ type, target_id, user: user._id });
    
  res
    .status(httpStatus.CREATED)
    .json({ message: "Create user favorite successfully" });
};
