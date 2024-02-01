import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    let suffixes = [".mp3", ".wav", ".flac", ".ogg", ".m4a", ".aiff", ".wma", ".aac", ".opus", ".alac"];
    let suffixesImg = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"];
    let messageSuffixes = suffixes.join(" ");
    if (file?.fieldname === "cover") {
      if (suffixesImg.includes(fileExtension)) {
        cb(null, path.join(__dirname, "../", "../", "public", "coverMusics"));
        return;
      }
      messageSuffixes = suffixesImg.join(" ");
    } else if (file?.fieldname === "music") {
      if (suffixes.includes(fileExtension)) {
        cb(null, path.join(__dirname, "../", "../", "public", "musics"));
      }
      return;
    }
    const message = `The extension entered is not valid. The file extension should only include: ${messageSuffixes}`;
    (cb as any)(new Error(message));
  },
  filename(req, file, cb) {
    const fileName = Date.now() + Math.random() * 20000 + "_" + file.originalname.replace(/\s/g, "_");
    cb(null, `${fileName}`);
  },
});

const fileSize = 15 * 1024 * 1024;

export default multer({ storage, limits: { fileSize } });
