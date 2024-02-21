import { Schema, model } from "mongoose";

const usersSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, require: true, trim: true },
    email: { type: String, required: true },
    password: { type: String, required: true, trim: true },
    isAdmin: { type: Boolean, default: false },
    isSuperAdmin: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    profile: { type: String, required: true },
  },
  { timestamps: true }
);

export default model("users", usersSchema);
