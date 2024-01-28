import { Request, Response, NextFunction } from "express";
import fs from "fs";
export default (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error) {
     removeFile(req)
    const statusCode = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error !!";
    res.status(statusCode).json({ message });
  }
};


function removeFile(req: Request) {
   req.file && fs.unlinkSync(req.file.path);

  if (req.files) {
    const files = { ...req.files } as any;
    for (let key in files) {
      if (files[key] && files[key][0]) {
        fs.unlinkSync(files[key][0].path);
      }
    }
  }
}
