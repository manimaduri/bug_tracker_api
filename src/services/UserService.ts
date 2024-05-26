import { User } from "../models/User";
import { UserRepository } from "../repositories/UserRepository";
import { hashPassword } from "../utils/hashPassword";
import jwt from "jsonwebtoken";
import { OrganizationRepository } from "../repositories/OrganizationRepository";
import { EmployeeRepository } from "../repositories/EmployeeRepository";
import { plainToClass } from "class-transformer";
import { CreateOrganizationDTO } from "../models/dto/OrganizationDTO";
import { EmployeeDTO } from "../models/dto/EmployeeDTO";
import { validateDTO } from "../utils/validateDTO";
import { initDB } from "../models";
import { CreateUserDTO, UserRole } from "../models/dto/UserDTO";
import { UniqueConstraintError } from "sequelize";

export class UserService {
  private userRepository: UserRepository;
  private organizationRepository: OrganizationRepository;
  private employeeRepository: EmployeeRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.organizationRepository = new OrganizationRepository();
    this.employeeRepository = new EmployeeRepository();
  }

  async createUser(user: Partial<User>) {
    let createdUser;
    let token;

    // Get the Sequelize instance
    const sequelize = await initDB();

    // Start a transaction
    const transaction = await sequelize.transaction();
    try {
      const userDTO = plainToClass(CreateUserDTO, user);
      await validateDTO(userDTO);

      // Hash the user's password
      userDTO.password = await hashPassword(userDTO.password);

      // Create the user
      createdUser = await this.userRepository.createUser(userDTO, {
        transaction,
      });
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
      }

      // Generate a JWT token for the user
      token = jwt.sign(
        { userId: createdUser.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY }
      );

      // If the user was created successfully, add data to the respective table based on the user's role
      if (user.role === UserRole.ORGANIZATION) {
        const organizationDTO = plainToClass(CreateOrganizationDTO, {
          userId: createdUser.id,
          ...user,
        });
        await validateDTO(organizationDTO);
        await this.organizationRepository.createOrganization(organizationDTO, {
          transaction,
        });
      } else if (user.role === UserRole.EMPLOYEE) {
        // Extract the domain from the email
        const emailDomain = userDTO.email.split("@")[1];

        // Check if there is an existing organization with the same email domain
        const organizationUser =
          await this.userRepository.findOrganizationUserByEmailDomain(
            emailDomain
          );

        if (!organizationUser?.id) {
          throw new Error(
            "No organization user found with the given email domain"
          );
        }

        const organization =
          await this.organizationRepository.findOrganizationByUserId(
            organizationUser.id
          );

        if (!organization) {
          throw new Error("No organization exists with the same email domain");
        }

        const employeeDTO = plainToClass(EmployeeDTO, {
          userId: createdUser.id,
          organizationId: organization.id,
          ...user,
        });
        await validateDTO(employeeDTO);

        await this.employeeRepository.createEmployee(employeeDTO, {
          transaction,
        });
      }

      // Commit the transaction
      await transaction.commit();
    } catch (error) {
      // If there was an error, rollback the transaction
      await transaction.rollback();
      if (error instanceof UniqueConstraintError) {
        throw new Error("User already exists!");
      }
      throw error;
    }
    // Return the created user and their token
    return {
      user: {
        id: createdUser.id,
        role: createdUser.role,
        profilePicture: createdUser.profilePicture,
      },
      token,
    };
  }
}
