import { UserRole } from "../models/dto/UserDTO";
import { User } from "../models/User";
import { Op, Transaction, UniqueConstraintError } from "sequelize";
import { HttpError } from "../utils/responseHandler";

export class UserRepository {
  async createUser(
    user: Partial<User>,
    options?: { transaction: Transaction }
  ) {
    try {
      // Use the transaction if it is provided
      return await User.create(user, options);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new HttpError("User already exists!",409);
      }
      console.log("Error creating user:", error);
      throw new HttpError(`Error creating user: ${error}`);
    }
  }

  async findOrganizationUserByEmailDomain(domain: string) {
    try {
      const organizationUser = await User.findOne({
        where: {
          email: {
            [Op.like]: `%@${domain}`,
          },
          role: UserRole.ORGANIZATION,
        },
      });
      
      return organizationUser;
    } catch (error) {
      console.log("Error finding organization by email domain:", error);
      throw new HttpError(`Error finding organization: ${error}`);
    }
  }
}
