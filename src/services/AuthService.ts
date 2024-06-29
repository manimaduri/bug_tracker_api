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
import { getSequelizeInstance } from "../models";
import { CreateUserDTO, UserRole } from "../models/dto/UserDTO";
import { UniqueConstraintError, Transaction } from "sequelize";
import { HttpError } from "../utils/responseHandler";
import bcrypt from "bcrypt";

type ResponseType = {
  user: {
    id: string;
    role: string;
    profilePicture: string | undefined;
  };
  token: string;
  organization?: any; // Consider defining a more specific type instead of 'any'
  employee?: any; // Consider defining a more specific type instead of 'any'
};

export class AuthService {
  private userRepository: UserRepository;
  private organizationRepository: OrganizationRepository;
  private employeeRepository: EmployeeRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.organizationRepository = new OrganizationRepository();
    this.employeeRepository = new EmployeeRepository();
  }

  async createUser(user: Partial<User>) {
    const sequelize = getSequelizeInstance();
    const transaction = await sequelize.transaction();
    let additionalData = null; // Variable to hold organization or employee data
    try {
      const userDTO = await this.prepareUserDTO(user);
      const createdUser = await this.userRepository.createUser(userDTO, {
        transaction,
      });
      const token = this.generateToken(createdUser, userDTO.role);

      if (user.role === UserRole.ORGANIZATION) {
        additionalData = await this.handleOrganizationUser(
          user,
          userDTO,
          createdUser,
          transaction
        );
      } else if (user.role === UserRole.EMPLOYEE) {
        additionalData = await this.handleEmployeeUser(
          user,
          userDTO,
          createdUser,
          transaction
        );
      }

      await transaction.commit();
      return this.formatResponse(createdUser, token, additionalData);
    } catch (error) {
      await transaction.rollback();
      this.handleError(error);
    }
  }

  async authenticateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new HttpError("Please register before login", 404);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpError("Invalid Credentials", 401);
    }

    const token = this.generateToken(user, user.role);

    // Fetch organization or employee data based on the user's role
    let additionalData = null;

    if (user.role === UserRole.ORGANIZATION) {
      additionalData =
        await this.organizationRepository.findOrganizationByUserId(user.id);
    } else if (user.role === UserRole.EMPLOYEE) {
      additionalData = await this.employeeRepository.findEmployeeByUserId(
        user.id
      );
    }

    return this.formatResponse(user, token, additionalData);
  }

  async prepareUserDTO(user: Partial<User>) {
    const userDTO = plainToClass(CreateUserDTO, user);
    await validateDTO(userDTO);
    userDTO.password = await hashPassword(userDTO.password);
    return userDTO;
  }

  generateToken(createdUser: User, role: string) {
    if (!process.env.JWT_SECRET) {
      throw new HttpError("JWT_SECRET is not defined");
    }
    return jwt.sign(
      { userId: createdUser.id, role: role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );
  }

  async handleOrganizationUser(
    user: Partial<User>,
    userDTO: CreateUserDTO,
    createdUser: User,
    transaction: Transaction
  ) {
    const organizationDTO = plainToClass(CreateOrganizationDTO, {
      userId: createdUser.id,
      ...user,
    });
    await validateDTO(organizationDTO);
    const organizationExists =
      await this.userRepository.findOrganizationUserByEmailDomain(
        userDTO.email.split("@")[1]
      );
    if (organizationExists) {
      throw new HttpError("Organization already exists", 400);
    }
    try {
      return await this.organizationRepository.createOrganization(
        organizationDTO,
        {
          transaction,
        }
      );
    } catch (error: any) {
      console.log("Failed to create organization", error?.message);
      throw new HttpError(
        error?.message || "Failed to create organization ",
        error?.statusCode || 500
      );
    }
  }

  async handleEmployeeUser(
    user: Partial<User>,
    userDTO: CreateUserDTO,
    createdUser: User,
    transaction: Transaction
  ) {
    const emailDomain = userDTO.email.split("@")[1];
    const organizationUser =
      await this.userRepository.findOrganizationUserByEmailDomain(emailDomain);
    if (!organizationUser?.id) {
      throw new HttpError(
        "No organization found with the given email domain",
        404
      );
    }
    const employeeDTO = plainToClass(EmployeeDTO, {
      userId: createdUser.id,
      organizationId: organizationUser?.organization.id,
      ...user,
    });
    await validateDTO(employeeDTO);
    try {
      return await this.employeeRepository.createEmployee(employeeDTO, {
        transaction,
      });
    } catch (error: any) {
      console.log("Failed to create employee", error?.message);
      throw new HttpError(
        error?.message || "Failed to create employee ",
        error?.statusCode || 500
      );
    }
  }

  formatResponse(createdUser: User, token: string, additionalData: any = null) {
    const response: ResponseType = {
      user: {
        id: createdUser.id,
        role: createdUser.role,
        profilePicture: createdUser.profilePicture,
      },
      token,
    };

    // Include additional data based on the user's role
    if (createdUser.role === UserRole.ORGANIZATION && additionalData) {
      response.organization = additionalData; // Assuming additionalData is the organization data
    } else if (createdUser.role === UserRole.EMPLOYEE && additionalData) {
      response.employee = additionalData; // Assuming additionalData is the employee data
    }

    return response;
  }

  handleError(error: any) {
    if (error instanceof UniqueConstraintError) {
      throw new HttpError("User already exists!", 409);
    }
    throw error;
  }
}
