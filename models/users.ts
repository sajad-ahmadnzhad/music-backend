import { Schema, model } from "mongoose";

const schema = new Schema({
  name: { type: String, required: true, trim: true },
  username: { type: String, require: true, trim: true  , unique: true},
  email: { type: String, required: true , unique: true },
  password: { type: String, required: true, trim: true },
  isAdmin: { type: Boolean, default: false },
  isSuperAdmin: {type: Boolean , default: false}
});
export default model('users' , schema)