import { Request, Response, NextFunction } from "express";
import fs from "fs";
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
  req.file?.path && fs.unlinkSync(req.file.path);

  if (req.files) {
    const files = Object.entries({ ...req.files })
      .flat(Infinity)
      .filter((file) => typeof file === "object");

    files.forEach(file => {
    const path = file.path || ''
     if (fs.existsSync(path)) return fs.unlinkSync(path);  
    })
  }
}
