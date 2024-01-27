import express from "express";
import fs from "fs";
import path from "path";
export default (
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (err) {
    try {
      if (req.file) {
        const folders = fs.readdirSync(path.join(process.cwd(), "public"));

        folders.forEach((folder) => {
          const files = fs.readdirSync(
            path.join(process.cwd(), "public", folder)
          );

          if (files.includes(req.file!.filename)) {
            fs.unlinkSync(
              path.join(process.cwd(), "public", folder, req.file!.filename)
            );
          }
        });
      }
      const statusCode = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error !!";
      res.status(statusCode).json({ message });
    } catch (error: any) {
      res
        .status(error.status || 500)
        .json({ message: error.message || "Internal Server Error !!" });
    }
  }
};
