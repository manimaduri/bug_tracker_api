import { User } from "../models/User";
import { UserProject } from "../models/UserProject";
import { UserProjectRepository } from "../repositories/UserProjectRepository";
import { HttpError } from "../utils/responseHandler";

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
  }