import { Schema, model } from "mongoose";
import { rimrafSync } from "rimraf";
import path from "path";
import serverNotificationModel from "./serverNotification";
import {
  validateCollaborators,
  handleCollaboratorsUpdate,
  handleAccessLevelChange,
} from "../helpers/collaboratorManagement";
const schema = new Schema(
  {
    title: { type: String, trim: true, required: true },
    image: { type: String },
    description: { type: String, trim: true },
    type: {
      type: String,
      enum: ["music", "album", "playList", "archive", "upcoming", "singer"],
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

schema.pre("save", async function (next) {
  try {
    const { accessLevel, collaborators } = this;

    const result = validateCollaborators(accessLevel, collaborators);

    if (result?.error) throw result.error;

    const createMessagePromise = collaborators.map((item) => {
      return serverNotificationModel.create({
        type: "category",
        message: "You have been invited to the category",
        receiver: item,
        target_id: this._id,
      });
    });

    await Promise.all(createMessagePromise);

    next();
  } catch (error: any) {
    next(error);
  }
});

schema.pre("findOneAndUpdate", async function (next) {
  try {
    let { accessLevel, collaborators }: any = this.getUpdate();

    const resultValidate = validateCollaborators(accessLevel, collaborators);

    if (resultValidate?.error) throw resultValidate.error;

    const category = (await this.model.findOne(this.getFilter())) as any;

    if (collaborators) {
      const resultCollaboratorsUpdate = await handleCollaboratorsUpdate(
        category,
        collaborators
      );

      if (resultCollaboratorsUpdate?.error)
        throw resultCollaboratorsUpdate.error;
    }

    if (accessLevel !== "selectedCollaborators") {
      (this as any).getUpdate().$set.collaborators = [];
      const resultAccessLevel = await handleAccessLevelChange(category);
      if (resultAccessLevel?.error) throw resultAccessLevel.error;
    }

    next();
  } catch (error: any) {
    next(error);
  }
});

schema.pre("deleteOne", async function (next) {
  try {
    const deletedCategory = await this.model.findOne(this.getFilter());
    await serverNotificationModel.deleteMany({
      target_id: deletedCategory._id,
      type: "category",
    });
    rimrafSync(path.join(process.cwd(), "public", deletedCategory.image));

    next();
  } catch (error: any) {
    next(error);
  }
});

schema.pre("deleteMany", async function (next) {
  try {
    const deletedCategories = await this.model.find(this.getFilter());
    const publicFolder = path.join(process.cwd(), "public");
    const imageCategories = deletedCategories.map(
      (category) => `${publicFolder}${category.image}`
    );
    const categoryIds = deletedCategories.map((category) => category._id);

    await serverNotificationModel.deleteMany({
      target_id: { $in: categoryIds },
      type: "category",
    });
    rimrafSync(imageCategories);

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
      .populate({
        path: "target_ids",
        select:
          "title description artist genre cover_image fullName englishName nickname photo musicStyle download_link",
        populate: [
          {
            path: "artist",
            select: "fullName englishName photo musicStyle",
            strictPopulate: false,
            populate: [
              {
                path: "musicStyle",
                select: "title description",
                strictPopulate: false,
              },
            ],
          },
          {
            path: "musicStyle",
            select: "title description",
            strictPopulate: false,
          },
          { path: "genre", select: "title description", strictPopulate: false },
        ],
      })
      .populate("likes", "name username profile")
      .sort({ createdAt: -1 })
      .select("-__v");
    next();
  } catch (error: any) {
    next(error);
  }
});

export default model("category", schema);
