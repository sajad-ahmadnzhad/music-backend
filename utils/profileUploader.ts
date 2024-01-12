import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination(req, file, cb) {
        const fileExtension = path.extname(file.originalname);
        const size = file.size
        console.log(size)
    let suffixes = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"];
    if (suffixes.includes(fileExtension)) {
      cb(null, path.join(__dirname, "../", "public", "userProfile"));
    } else {
      const message = `The extension of the submitted file is not valid. The extension of the submitted files must include: ${suffixes.join(
        " "
      )}`;
      (cb as any)(new Error(message));
    }
  },
  filename(req, file, cb) {
    const fileName =
      Date.now() + Math.random() * 20000 + "_" + file.originalname;
    const ext = path.extname(file.originalname);
    cb(null, `${fileName}${ext}`);
  },
});

const fileSize = 2 * 1024 * 1024;

export default multer({ storage, limits: { fileSize } });
