import { UserRole } from "../models/dto/UserDTO";
import { User } from "../models/User";
import { Op, Transaction } from "sequelize";

export class UserRepository {
  async createUser(
    user: Partial<User>,
    options?: { transaction: Transaction }
  ) {
    // Use the transaction if it is provided
    return await User.create(user, options);
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
      throw new Error(`Error finding organization by email domain: ${error}`);
    }
  }
}
