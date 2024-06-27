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
import { UniqueConstraintError, Transaction } from "sequelize";
import { HttpError } from "../utils/responseHandler";
import bcrypt from "bcrypt";

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
    const sequelize = await initDB();
    const transaction = await sequelize.transaction();
    try {
      const userDTO = await this.prepareUserDTO(user);
      const createdUser = await this.userRepository.createUser(userDTO, {
        transaction,
      });
      const token = this.generateToken(createdUser, userDTO.role);

      if (user.role === UserRole.ORGANIZATION) {
        await this.handleOrganizationUser(
          user,
          userDTO,
          createdUser,
          transaction
        );
      } else if (user.role === UserRole.EMPLOYEE) {
        await this.handleEmployeeUser(user, userDTO, createdUser, transaction);
      }

      await transaction.commit();
      return this.formatResponse(createdUser, token);
    } catch (error) {
      await transaction.rollback();
      this.handleError(error);
    }
  }

  async authenticateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new HttpError("User not found", 404);
    }
  
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpError("Invalid Credentials", 401);
    }
  
    const token = this.generateToken(user, user.role);
  
    return this.formatResponse(user, token);
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
      throw new HttpError("Organization already exists",400);
    }
    try {
      await this.organizationRepository.createOrganization(organizationDTO, {
        transaction,
      });
    } catch (error: any) {
      console.log("Failed to create organization", error?.message);
      throw new HttpError(error?.message || "Failed to create organization ", error?.statusCode || 500);
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
      throw new HttpError("No organization found with the given email domain", 404);
    }
    const employeeDTO = plainToClass(EmployeeDTO, {
      userId: createdUser.id,
      organizationId: organizationUser?.Organization.id,
      ...user,
    });
    await validateDTO(employeeDTO);
    try {
      await this.employeeRepository.createEmployee(employeeDTO, {
        transaction,
      });
    } catch (error: any) {
      console.log("Failed to create employee", error?.message);
      throw new HttpError(error?.message || "Failed to create employee ", error?.statusCode || 500);
    }
  }

  formatResponse(createdUser: User, token: string) {
    return {
      user: {
        id: createdUser.id,
        role: createdUser.role,
        profilePicture: createdUser.profilePicture,
      },
      token,
    };
  }

  handleError(error: any) {
    if (error instanceof UniqueConstraintError) {
      throw new HttpError("User already exists!", 409);
    }
    throw error;
  }
}
