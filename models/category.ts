import { Schema, model } from "mongoose";
import httpErrors from "http-errors";
import { rimrafSync } from "rimraf";
import path from "path";
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
      },
    ],
    collaborators: [{ type: Schema.ObjectId, ref: "users", default: [] }],
    accessLevel: {
      type: String,
      enum: ["private", "allAdmins", "selectedCollaborators"],
      default: "private",
    },
    genre: { type: Schema.ObjectId, ref: "genre" },
    likes: [{ type: Schema.ObjectId, ref: "users", required: true }],
    country: { type: Schema.ObjectId, ref: "country", required: true },
    createBy: { type: Schema.ObjectId, ref: "users", required: true },
  },
  { timestamps: true }
);

schema.pre("save", function (next) {
  try {
    const { accessLevel, collaborators } = this;
    if (accessLevel == "selectedCollaborators" && !collaborators?.length) {
      throw httpErrors.BadRequest("No admin has been selected");
    } else if (
      accessLevel !== "selectedCollaborators" &&
      collaborators?.length
    ) {
      throw httpErrors.BadRequest("The collaborators field is not allowed");
    }

    if (collaborators?.length) {
      const findDuplicates = (collaborators as []).filter((item, index) => {
        return collaborators.indexOf(item) !== index;
      });
      if (findDuplicates.length) {
        throw httpErrors.BadRequest(
          `Duplicate ids found in the array: ${findDuplicates}`
        );
      }
    }

    next();
  } catch (error: any) {
    next(error);
  }
});

schema.pre("findOneAndUpdate", async function (next) {
  try {
    const { accessLevel, collaborators }: any = this.getUpdate();
    if (accessLevel == "selectedCollaborators" && !collaborators?.length) {
      throw httpErrors.BadRequest("No admin has been selected");
    } else if (
      accessLevel !== "selectedCollaborators" &&
      collaborators?.length
    ) {
      throw httpErrors.BadRequest("The collaborators field is not allowed");
    }

    if (collaborators?.length) {
      const findDuplicates = (collaborators as []).filter((item, index) => {
        return collaborators.indexOf(item) !== index;
      });
      if (findDuplicates.length) {
        throw httpErrors.BadRequest(
          `Duplicate ids found in the array: ${findDuplicates}`
        );
      }
    }

    next();
  } catch (error: any) {
    next(error);
  }
});

schema.pre("deleteOne", async function (next) {
  try {
    const deletedCategory = await this.model.findOne(this.getFilter());

    rimrafSync(path.join(process.cwd(), "public", deletedCategory.image));

    next();
  } catch (error: any) {
    next(error);
  }
});

schema.pre(["find", "findOne"], function (next) {
  try {
    this.populate("createBy", "name username profile")
      .populate("collaborators", "name username profile")
      .populate("genre", "title description")
      .populate("country", "title description image")
      .populate(
        "target_ids",
        "title description cover_image download_link duration"
      )
      .populate("likes", "name username profile")
      .sort({ createdAt: -1 })
      .select("-__v");
    next();
  } catch (error: any) {
    next(error);
  }
});

export default model("category", schema);
