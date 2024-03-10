import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    title: { type: String, trim: true, required: true },
    image: { type: String },
    description: { type: String, trim: true },
    type: {
      type: String,
      enum: ["music", "album", "playList", "archive", "upcoming", "signer"],
      required: true,
    },
    target_ids: [
      {
        type: Schema.ObjectId,
        refPath: "type",
        default: [],
        addedBy: { type: Schema.ObjectId, ref: "users" },
      },
    ],
    collaborators: [{ type: Schema.ObjectId, ref: "users", default: [] }],
    accessLevel: {
      type: String,
      enum: ["private", "allAdmins", "selectedCollaborators"],
      default: "private",
    },
    genre: { type: Schema.ObjectId, ref: "genre" },
    country: { type: Schema.ObjectId, ref: "country", required: true },
    createBy: { type: Schema.ObjectId, ref: "users", required: true },
  },
  { timestamps: true }
);

export default model("category", schema);
