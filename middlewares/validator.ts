import Joi from "joi";
import httpStatus from "http-status";
import { Request, Response, NextFunction } from "express";
import removeFile from "../helpers/removeFile";
//validate schema joi middlewares
export default (schema: Joi.Schema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validateAsync({ ...req.body });
      next();
    } catch (e: any) {
      //Delete files sent by multer after incorrect validation
      removeFile(req);

      let errorMessage = e.message;

      if (e.message?.match(/"/g) && e.message.includes("Error code")) {
        errorMessage = e.message.split('"')[1];
      } else if (e.message.includes('"')) {
        errorMessage = e.message.replace(/"/g, "").trim();
      }

      res
        .status(httpStatus.BAD_REQUEST)
        .json({ [e.details[0].path[0] || "validation error"]: errorMessage });
    }
  };
};
