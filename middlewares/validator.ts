import Joi from "joi";
import httpStatus from "http-status";
import { Request, Response, NextFunction } from "express";
import fs from "fs";
//validate schema joi middlewares
export default (schema: Joi.Schema) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
        await schema.validateAsync({ ...req.body });
      next();
    } catch (e: any) {
      //Delete files sent by multer after incorrect validation
      removeFile(req);

      let errorMessage = e.message;

      if (e.message?.match(/"/g) && e.message.includes('Error code')) {
        errorMessage = e.message.split('"')[1];
      } else if (e.message.includes('"')) {
        errorMessage = e.message.replace(/"/g , "").trim()
      }

      res
        .status(httpStatus.BAD_REQUEST)
        .json({ [e.details[0].path[0]]: errorMessage });
    }
  };
};

function removeFile(req: Request) {
  //Delete user profile when validating incorrectly
  if (req.file) {
    fs.unlinkSync(req.file.path);
  }

  //Removing music and cover when validating incorrectly
  if (req.files) {
    const files = { ...req.files } as any;
    for (let key in files) {
      if (files[key] && files[key][0]) {
        fs.unlinkSync(files[key][0].path);
      }
    }
  }
}
