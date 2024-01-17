import { Schema, model } from "mongoose";
const schema = new Schema(
  {
    title: { type: String, required: true },
    parent: {type: Schema.ObjectId , ref: 'categories'},
    description: { type: String },
  }
);

schema.virtual('categoryParent', {
  localField: 'parent',
  foreignField: '_id',
  ref: 'categories'
})

export default model("categories", schema);
