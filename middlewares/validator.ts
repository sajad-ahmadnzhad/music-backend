import Joi from "joi";
import httpStatus from "http-status";
import { RegisterBody } from "./../interfaces/auth";
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

        if (req.file) {
          const { filename, fieldname } = req.file;
          let folderFile = 'musics'
          if (fieldname === 'profile') {
            folderFile = 'usersProfile'
          }
          fs.unlinkSync(
            path.join(__dirname, "../", "public", folderFile, filename)
          );
        }

        res.status(httpStatus.BAD_REQUEST).json(error);
        return;
      }
      next();
    } catch (e) {
      res.status(httpStatus.BAD_REQUEST).json(e);
    }
  };
};
