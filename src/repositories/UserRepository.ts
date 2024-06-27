import { UserRole } from "../models/dto/UserDTO";
import { User } from "../models/User";
import { Op, Transaction, UniqueConstraintError } from "sequelize";
import { HttpError } from "../utils/responseHandler";
import { Organization } from "../models/Organization";

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
      console.error("Error creating user:", error);
      throw new HttpError(`Unable to register`);
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
        include: [{ model: Organization }],
      });
      
      return organizationUser;
    } catch (error) {
      console.error("Error finding organization by email domain:", error);
      throw new HttpError(`Error finding organization`);
    }
  }

  async findUserByEmail(email: string) {
    try {
      const user = await User.findOne({
        where: {
          email: email,
        },
      });
  
      return user;
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw new HttpError(`Error finding user: ${error}`);
    }
  }
}
