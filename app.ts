import express from "express";
import path from 'path'
import dotenv from 'dotenv';
import "./configs/db"
dotenv.config()
const app = express();
const port = process.env.PORT || 4000;
app.use(express.json())
app.use(express.static(path.join(__dirname,'public')))

app.listen(port, () => console.log(`Server running on port ${port}`));
