import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
export default (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error) {
    removeFile(req);
    const statusCode = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error !!";
    res.status(statusCode).json({ message });
  }
};

function removeFile(req: Request) {
  if (req.file) {
    const folders = fs.readdirSync(path.join(process.cwd(), "public"));

    folders.forEach((folder) => {
      const files = fs.readdirSync(path.join(process.cwd(), "public", folder));

      if (files.includes(req.file!.filename)) {
        fs.unlinkSync(
          path.join(process.cwd(), "public", folder, req.file!.filename)
        );
      }
    });
  }
}
