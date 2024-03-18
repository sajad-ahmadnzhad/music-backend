import httpErrors from "http-errors";
import { Types } from "mongoose";
import serverNotificationModel from "../models/serverNotification";

export function validateCollaborators(
  accessLevel: string,
  collaborators: Types.ObjectId[]
) {
  try {
    if (accessLevel === "selectedCollaborators") {
      if (!collaborators?.length) {
        throw httpErrors.BadRequest("No admin has been selected");
      }

      const duplicateCollaborators = collaborators.filter(
        (item, index) => collaborators.indexOf(item) !== index
      );
      if (duplicateCollaborators.length) {
        throw httpErrors.BadRequest(
          `Duplicate ids found in collaborators: ${duplicateCollaborators}`
        );
      }
    } else if (
      accessLevel !== "selectedCollaborators" &&
      collaborators?.length
    ) {
      throw httpErrors.BadRequest(
        "The collaborators field is not allowed for this access level"
      );
    }
  } catch (error: any) {
    return { error };
  }
}

export async function handleCollaboratorsUpdate(
  category: any,
  collaborators: Types.ObjectId[]
) {
  try {
    const existingCollaboratorIds = category.collaborators.map((c: any) =>
      String(c._id)
    );
    const newCollaborators = collaborators.filter(
      (item) => !existingCollaboratorIds.includes(item)
    );
    const removedCollaborators = existingCollaboratorIds.filter(
      (item: any) => !collaborators.includes(item)
    );

    const createMessageForNew = newCollaborators.map((item) =>
      serverNotificationModel.create({
        type: "category",
        message: "You have been invited to the category",
        receiver: item,
        target_id: category._id,
      })
    );

    const createMessageForRemoved = removedCollaborators.map((item: any) =>
      serverNotificationModel.create({
        type: "category",
        message: "You have been removed from the category.",
        receiver: item,
        target_id: category._id,
      })
    );

    await Promise.all([...createMessageForNew, ...createMessageForRemoved]);
  } catch (error: any) {
    return { error };
  }
}

export async function handleAccessLevelChange(category: any) {
  try {
    const createMessageForAccessLevelChange = category.collaborators.map(
      (item: any) =>
        serverNotificationModel.create({
          type: "category",
          message:
            "The category type has been changed. You have been removed from the collaborators list",
          receiver: item,
          target_id: category._id,
        })
    );

    await Promise.all(createMessageForAccessLevelChange);
  } catch (error: any) {
    return { error };
  }
}
