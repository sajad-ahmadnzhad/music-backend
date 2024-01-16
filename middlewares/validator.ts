import Joi from "joi";
import httpStatus from "http-status";
import { RegisterBody } from "./../interfaces/auth";
import { MusicFile } from "./../interfaces/music";
import express from "express";
import fs from "fs";
import path from "path";
//validate schema joi middlewares
export default (schema: Joi.Schema) => {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const validateSchema = schema.validate(req.body as RegisterBody);
      if (validateSchema.error) {
        const error = {
          [validateSchema.error.details[0].path[0]]:
            validateSchema.error.message.replace(/"/g, ""),
        };
        //Delete files sent by multer after incorrect validation
        removeFile(req);
        res.status(httpStatus.BAD_REQUEST).json(error);
        return;
      }
      next();
    } catch (e) {
      res.status(httpStatus.BAD_REQUEST).json(e);
    }
  };
};

function removeFile(req: express.Request) {
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
