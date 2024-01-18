import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const fileExtension = path.extname(file.originalname);
    let suffixes = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"];
    if (
      suffixes.includes(fileExtension?.toLowerCase()) &&
      file.fieldname == "profile"
    ) {
      cb(null, path.join(__dirname, "../", "../", "public", "usersProfile"));
      return;
    }
    //image singer
    else if (
      suffixes.includes(fileExtension?.toLowerCase()) &&
      file.fieldname == "photo"
    ) {
      cb(null, path.join(__dirname, "../", "../", "public", "photoSingers"));
      return;
    }
    const message = `The extension of the submitted file is not valid. The extension of the submitted files must include: ${suffixes.join(
      " "
    )}`;
    (cb as any)(new Error(message));
  },
  filename(req, file, cb) {
    const fileName =
      Date.now() +
      Math.random() * 20000 +
      "_" +
      file.originalname.replace(/\s/g, "_");
    cb(null, `${fileName}`);
  },
});

const fileSize = 2 * 1024 * 1024;

export default multer({ storage, limits: { fileSize } });
