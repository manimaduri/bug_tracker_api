import { Request } from "express";
import { UserProject } from "../models/UserProject";
import { UserProjectRepository } from "../repositories/UserProjectRepository";
import { HttpError } from "../utils/responseHandler";
import { getSequelizeInstance } from "../models";

export class UserProjectService {
    // Assuming you have a repository or a way to access the database
    private userProjectRepository : UserProjectRepository
    constructor() {
        this.userProjectRepository= new UserProjectRepository();
    }
  
    async getUsersByProject(projectId: string): Promise<UserProject[]> {
        try {
          // Logic to fetch and return all users assigned to the given project
          return await this.userProjectRepository.findUsersByProjectId(projectId);
        } catch (error:any) {
          // Assuming HttpError is a class that takes a message and a status code
          throw new HttpError(error?.message ??"Failed to find users by project ID", error?.statusCode ?? 500);
        }
      }

      async removeUserFromProject(req: Request): Promise<void> {
        const transaction = await getSequelizeInstance().transaction();
        try {
          const { userId, projectId } = req.params;
          const role = req.user!.role;
          const user = req.user!.userId;
          if (!(role === "organization" || role === "manager")) {
            throw new HttpError("You do not have permission to remove this user", 403);
          }
          const userExists = await this.userProjectRepository.isUserAssignedToProject(user, projectId);
          if (!userExists) {
            throw new HttpError("You are not assigned to this project", 404);
          }
          // Logic to remove the user from the project
          await this.userProjectRepository.removeUserFromProject(userId, projectId, transaction);
          await transaction.commit(); // Commit the transaction
        } catch (error: any) {
          await transaction.rollback(); // Rollback the transaction in case of an error
          // Assuming HttpError is a class that takes a message and a status code
          throw new HttpError(error?.message ?? "Failed to remove user from project", error?.statusCode ?? 500);
        }
      }

      //addUsertpProject method

      async addUserToProject(req:Request): Promise<UserProject> {
        const sequelize = getSequelizeInstance(); // Obtain the Sequelize instance
        const transaction = await sequelize.transaction();
        try {
          const { userId, projectId } = req.body;
          const role = req.user!.role;
          const user = req.user!.userId;
          if (!(role === "organization" || role === "manager")) {
            throw new HttpError("You do not have permission to add this user", 403);
          }
          const userExists = await this.userProjectRepository.isUserAssignedToProject(user, projectId);
          if (!userExists) {
            throw new HttpError("You are not assigned to this project", 404);
          }
          // Logic to add the user to the project
    const result = await this.userProjectRepository.associateUserWithProject(userId, projectId, transaction);
    await transaction.commit(); // Commit the transaction
    return result;
        } catch (error:any) {
          await transaction.rollback();
          // Assuming HttpError is a class that takes a message and a status code
          throw new HttpError(error?.message ??"Failed to add user to project", error?.statusCode ?? 500);
        }
      }
  }