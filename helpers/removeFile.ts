import { Request } from "express";
import { rimrafSync } from "rimraf";
export default (req: Request) => {
  req.file?.path && rimrafSync(req.file.path);

  if (req.files) {
    const paths = Object.entries({ ...req.files })
      .flat(Infinity)
      .filter((file) => typeof file === "object")
      .map((file) => (file as any).path);
    rimrafSync(paths);
  }
};
