import Joi from "joi";
import httpStatus from "http-status";
import { RegisterBody } from "./../interfaces/auth";
import express from "express";
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
        res.status(httpStatus.BAD_REQUEST).json(error);
        return;
      }
      next();
    } catch (e) {
      res.status(httpStatus.BAD_REQUEST).json(e);
    }
  };
};
