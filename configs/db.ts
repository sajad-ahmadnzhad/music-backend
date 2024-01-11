import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const mongodbUri = process.env.MONGODB_URI as string;

export default (async () => {
  try {
    await mongoose.connect(mongodbUri);
    console.log("Connect to db movie successfully");
  } catch (e) {
    console.log(`connection to db error => ${e}`);
  }
})();
