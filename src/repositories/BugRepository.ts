import { Bug } from "../models/Bug";
import { User } from "../models/User";
import { HttpError } from "../utils/responseHandler";

export class BugRepository {
  async createBug(bugData: Partial<Bug>) {
    try {
      const result = await Bug.create(bugData);
      return result;
    } catch (error) {
      throw new HttpError(`Error creating bug`);
    }
  }

  async findBugsByProjectId(projectId: string) {
    try {
      const bugs = await Bug.findAll({ where: { projectId }, include: [
        {
          model: User,
          as: 'createdUser',
          attributes: { exclude: ['password',"createdAt","updatedAt"] }
        },
        {
          model: User,
          as: 'assignedUser',
          attributes: { exclude: ['password',"createdAt","updatedAt"] }
        }
      ] });

      return bugs;
    } catch (error) {
      throw new HttpError(`Error finding bugs by project ID`);
    }
  }
}
