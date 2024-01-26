import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    user: { type: String, ref: "users", required: true },
    type: { type: String, enum: ["music", "albums"], required: true },
    target_id: { type: Schema.ObjectId, refPath: "type", required: true },
  },
  { timestamps: true }
);

export default model("userFavorite", schema);
