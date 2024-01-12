import express from "express";
import path from "path";
import cookieParser from 'cookie-parser'
import dotenv from "dotenv";
import "./configs/db";
import allRoutes from "./routes/main";
import notFoundMiddlewares from './middlewares/notFound'
import errorsMiddlewares from './middlewares/errors'
dotenv.config();
const app = express();
const port = process.env.PORT || 4000;
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser())
app.use(allRoutes);
app.use(notFoundMiddlewares)
app.use(errorsMiddlewares)
app.listen(port, () => console.log(`Server running on port ${port}`));
