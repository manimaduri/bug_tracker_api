import { Transaction } from "sequelize";
import { UserProject } from "../models/UserProject";
import { HttpError } from "../utils/responseHandler";
import { UserRepository } from "./UserRepository";

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
}