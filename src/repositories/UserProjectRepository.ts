import { Transaction } from "sequelize";
import { UserProject } from "../models/UserProject";
import { HttpError } from "../utils/responseHandler";
import { UserRepository } from "./UserRepository";
import { Project } from "../models/Project";
import { Bug, BugStatus } from "../models/Bug";
import { User } from "../models/User";

export class UserProjectRepository {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }
  async associateUserWithProject(userId: string, projectId: string, transaction?: Transaction) {
    try {
      const userExists = await this.userRepository.findUserById(userId);
      if (!userExists) {
        console.log(`User with ID ${userId} not found`);
        throw new HttpError(`Employee not found`, 404); // Use appropriate HTTP status code
      }
      const result = await UserProject.create({ userId, projectId }, {transaction});
      return result;
    } catch (error : any) {
      throw new HttpError(error?.message ?? `Error associating user with project`, error?.statusCode ?? 500);
    }
  }

  async isUserAssignedToProject(userId: string, projectId: string) {
    try {
      const result = await UserProject.findOne({ where: { userId, projectId } });
      if (!result) {
        throw new HttpError(`You are not assigned to the project`, 403);
      }
      return result;
    } catch (error : any) {
      console.error(error);
      throw new HttpError(error?.message ?? `Error checking user assignment to project`, error?.statusCode ?? 500);
    }
  };

  async findProjectsByUserId(userId: string) {
    try {
      const projects = await UserProject.findAll({
        where: { userId },
        include: [
          {
            model: Project,
            as: "project",
            include: [
              {
                model: Bug,
                as: "bugs",
                attributes: ["status"],
                required: false, // Include projects even if they have no bugs
              },
            ],
          },
        ],
      });
  
      const projectsWithDetails = projects.map((userProject) => {
        const project = userProject.project.toJSON();
        const bugs = project.bugs || [];
        const totalBugsCount = bugs.length;
        const openBugsCount = bugs.filter((bug : {status : BugStatus}) => bug.status === "Open").length;
        const progress = totalBugsCount > 0 ? ((totalBugsCount - openBugsCount) / totalBugsCount) * 100 : 0;
  
        // Destructure the project object to omit the bugs property
        const { bugs: _, ...projectDetails } = project;
  
        return {
          ...projectDetails,
          totalBugsCount,
          openBugsCount,
          progress,
        };
      });
  
      return projectsWithDetails;
    } catch (error) {
      console.error(error);
      throw new HttpError(`Error finding projects by user ID`);
    }
  }
  async findUsersByProjectId(projectId: string) {
    try {
      return await UserProject.findAll({
        where: { projectId },
        include: {
          model: User,
        },
      });
    } catch (error) {
      // Assuming HttpError is a class that takes a message and a status code
      throw new HttpError("Failed to find users by project ID", 500);
    }
  }

  //remove user from project
  async removeUserFromProject(userId: string, projectId: string, transaction?: Transaction) {
    try {
      const userProject = await UserProject.findOne({ where: { userId, projectId } });
      if (!userProject) {
        throw new HttpError(`User not assigned to project`, 404);
      }
      await userProject.destroy({ transaction });
    } catch (error : any) {
      throw new HttpError(error?.message ?? `Error removing user from project`, error?.statusCode ?? 500);
    }
  }
}