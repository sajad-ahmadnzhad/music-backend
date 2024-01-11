import express from "express";
import path from "path";
import cookieParser from 'cookie-parser'
import dotenv from "dotenv";
import "./configs/db";
import allRoutes from "./routes/main";
dotenv.config();
const app = express();
const port = process.env.PORT || 4000;
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser())
app.use(allRoutes);
app.listen(port, () => console.log(`Server running on port ${port}`));
