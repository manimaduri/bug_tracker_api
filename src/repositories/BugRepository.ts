import { Op } from "sequelize";
import { Bug } from "../models/Bug";
import { Project } from "../models/Project";
import { User } from "../models/User";
import { HttpError } from "../utils/responseHandler";
import { UserProject } from "../models/UserProject";
import { UserProjectRepository } from "./UserProjectRepository";

export class BugRepository {
  private userProjectRepository: UserProjectRepository;
  constructor() {
    this.userProjectRepository = new UserProjectRepository();
  }
  async createBug(bugData: Partial<Bug>) {
    try {
      const result = await Bug.create(bugData);
      return result;
    } catch (error) {
      console.error(error);
      throw new HttpError(`Error creating bug`);
    }
  }

  async findBugsByProjectId(projectId: string) {
    try {
      const bugs = await Bug.findAll({
        where: { projectId },
        include: [
          {
            model: User,
            as: "createdUser",
            attributes: { exclude: ["password", "createdAt", "updatedAt"] },
          },
          {
            model: User,
            as: "assignedUser",
            attributes: { exclude: ["password", "createdAt", "updatedAt"] },
          },
        ],
      });

      return bugs;
    } catch (error) {
      console.error(error);
      throw new HttpError(`Error finding bugs by project ID`);
    }
  }

  async findBugById(bugId: string, userId: string) {
    try {
      const bug = await Bug.findByPk(bugId, {
        include: [
          {
            model: User,
            as: "createdUser",
            attributes: { exclude: ["password", "createdAt", "updatedAt"] },
          },
          {
            model: User,
            as: "assignedUser",
            attributes: { exclude: ["password", "createdAt", "updatedAt"] },
          },
          {
            model: Project,
            as: "project",
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
        ],
      });
      if(bug){
        const projectId = bug.projectId;
        await this.userProjectRepository.isUserAssignedToProject(userId, projectId);
      }
      return bug;
    } catch (error) {
      console.error(error);
      throw new HttpError(`Error finding bug by ID`);
    }
  }

  async findBugsAssignedToUsers(userIds: string[]) {
    try {
      const bugs = await Bug.findAll({
        where: { assignedTo: { [Op.in]: userIds } },
        include: [
          {
            model: User,
            as: "createdUser",
            attributes: { exclude: ["password", "createdAt", "updatedAt"] },
          },
          {
            model: User,
            as: "assignedUser",
            attributes: { exclude: ["password", "createdAt", "updatedAt"] },
          },
        ],
      });

      return bugs;
    } catch (error) {
      console.error(error);
      throw new HttpError(`Error finding bugs by user ID`);
    }
  }

  async findBugsCreatedByUsers(userIds: string[]) {
    try {
      const bugs = await Bug.findAll({
        where: { createdBy: { [Op.in]: userIds } },
        include: [
          {
            model: User,
            as: "createdUser",
            attributes: { exclude: ["password", "createdAt", "updatedAt"] },
          },
          {
            model: User,
            as: "assignedUser",
            attributes: { exclude: ["password", "createdAt", "updatedAt"] },
          },
        ],
      });

      return bugs;
    } catch (error) {
      console.error(error);
      throw new HttpError(`Error finding bugs by user ID`);
    }
  }

  async findAllBugs(userId: string) {
    try {
      // Step 1: Find all projects the user is involved in
      const userProjects = await UserProject.findAll({
        where: { userId },
        attributes: ['projectId'],
      });
  
      // Step 2: Extract project IDs
      const projectIds = userProjects.map(up => up.projectId);
  
      // Step 3: Find all bugs in those projects
      const bugs = await Bug.findAll({
        where: {
          projectId: { [Op.in]: projectIds },
        },
        include: [
          {
            model: User,
            as: "createdUser",
            attributes: { exclude: ["password", "createdAt", "updatedAt"] },
          },
          {
            model: User,
            as: "assignedUser",
            attributes: { exclude: ["password", "createdAt", "updatedAt"] },
          },
          {
            model : Project,
            as : "project",
          }
        ],
      });
  
      return bugs;
    } catch (error) {
      console.error(error);
      throw new HttpError(`Error finding all bugs`);
    }
  }
}
