import multer from "multer";
import path from "path";
import httpErrors from "http-errors";

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const fileExtension = path.extname(file.originalname);
    let suffixes = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"];
    //user profile
    if (
      suffixes.includes(fileExtension?.toLowerCase()) &&
      file.fieldname == "profile"
    ) {
      cb(null, path.join(process.cwd(), "public", "usersProfile"));
      return;
    }
    //image singer
    else if (
      suffixes.includes(fileExtension?.toLowerCase()) &&
      file.fieldname == "photo"
    ) {
      cb(null, path.join(process.cwd(), "public", "photoSingers"));
      return;
    }
    // image album
    else if (
      suffixes.includes(fileExtension?.toLowerCase()) &&
      file.fieldname == "albumPhoto"
    ) {
      cb(null, path.join(process.cwd(), "public", "albumPhotos"));
      return;
    }
    //upcoming cover
    else if (
      suffixes.includes(fileExtension?.toLowerCase()) &&
      file.fieldname == "upcomingCover"
    ) {
      cb(null, path.join(process.cwd(), "public", "upcomingCovers"));
      return;
    }
    //playlist cover
    else if (
      suffixes.includes(fileExtension?.toLowerCase()) &&
      file.fieldname == "playListCover"
    ) {
      cb(null, path.join(process.cwd(), "public", "playListCovers"));
      return;
    }
    //archive cover
    else if (
      suffixes.includes(fileExtension?.toLowerCase()) &&
      file.fieldname == "archiveCover"
    ) {
      cb(null, path.join(process.cwd(), "public", "archiveCovers"));
      return;
    }
    const message = `The extension of the submitted file is not valid. The extension of the submitted files must include: ${suffixes.join(
      " "
    )}`;
    (cb as any)(httpErrors.BadRequest(message));
  },
  filename(req, file, cb) {
    const fileName =
      Date.now() +
      Math.random() * 20000 +
      "_" +
      file.originalname.replace(/\s/g, "-");
    cb(null, `${fileName}`);
  },
});

const fileSize = 2 * 1024 * 1024;

export default multer({ storage, limits: { fileSize } });
