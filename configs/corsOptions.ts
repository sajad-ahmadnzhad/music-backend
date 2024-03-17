import { CorsOptions } from "cors";
const allowedOrigins = JSON.parse(process.env.ALLOWED_ORIGINS as string) || [];
const corsOptions: CorsOptions = {
  origin: (origin = "", cb) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      cb(null, true);
    } else {
      cb(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
};
export default corsOptions;
