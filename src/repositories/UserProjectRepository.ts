import { UserProject } from "../models/UserProject";
import { HttpError } from "../utils/responseHandler";

export class UserProjectRepository {
  async associateUserWithProject(userId: string, projectId: string) {
    try {
      const result = await UserProject.create({ userId, projectId });
      return result;
    } catch (error) {
      throw new HttpError(`Error associating user with project`);
    }
  }
}