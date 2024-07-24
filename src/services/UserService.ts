import { Request } from "express";
import { EmployeeRepository } from "../repositories/EmployeeRepository";
import { OrganizationRepository } from "../repositories/OrganizationRepository";
import { UserRepository } from "../repositories/UserRepository";
import { HttpError } from "../utils/responseHandler";
import { plainToClass } from "class-transformer";
import { UpdateUserDTO } from "../models/dto/UpdateUserDTO";
import { validateDTO } from "../utils/validateDTO";
import { deleteObjectFromS3, generatePresignedUrl } from "../utils/uploadFiles";
import { UserRole } from "../models/dto/UserDTO";

export class UserService {
  private userRepository: UserRepository;
  private organizationRepository: OrganizationRepository;
  private employeeRepository: EmployeeRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.organizationRepository = new OrganizationRepository();
    this.employeeRepository = new EmployeeRepository();
  }

  async updateUser(req: Request) {
    try {
      const userId = req.user!.userId;
      const currentUserDetails = await this.userRepository.findUserById(userId);
      if (!currentUserDetails) {
        throw new HttpError("User not found", 404);
      }
      const {
        role,
        password,
        profilePicture,
        id,
        createdAt,
        updatedAt,
        ...userData
      } = req.body;
      if (userData?.email?.includes("@")) {
        const domain = userData.email.split("@")[1];
        const currentdomain = currentUserDetails.email.split("@")[1];
        if (domain !== currentdomain) {
          throw new HttpError("Email domain does not match organization", 403);
        }
      }
      const user = plainToClass(UpdateUserDTO, userData);
      await validateDTO(user);
      const updatedUser = await this.userRepository.updateUser(userId, user);

      return updatedUser;
    } catch (error: any) {
      throw new HttpError(
        error?.message ?? "Failed to update user",
        error?.statusCode || 500
      );
    }
  }

  async updateProfilePicture(req: Request) {
    try {
      const userId = req.user!.userId;
      const imageKey = req.body.imageKey;

      if (!imageKey) {
        throw new HttpError("Please upload an image", 400);
      }

      const currentUserDetails = await this.userRepository.findUserById(userId);

      if (!currentUserDetails) {
        throw new HttpError("User not found", 404);
      }

      const profilePicture = await generatePresignedUrl(imageKey);

      await this.userRepository.updateUser(userId, {
        profilePicture: imageKey,
      });

      if (currentUserDetails.profilePicture) {
        try {
          await deleteObjectFromS3(currentUserDetails.profilePicture);
        } catch (error) {
          console.error("Error deleting image from S3", error);
          try {
            await this.userRepository.updateUser(userId, {
              profilePicture: currentUserDetails.profilePicture,
            });
          } catch (rollbackError) {
            console.error("Error rollback updating picture", rollbackError);
            throw new HttpError("Error updating picture", 500);
          }
          throw new HttpError("Error updating picture", 500);
        }
      }

      return { profilePicture };
    } catch (error: any) {
      throw new HttpError(
        error?.message ?? "Failed to update profile picture",
        error?.statusCode || 500
      );
    }
  }

  async deleteProfilePicture(req: Request) {
    try {
      const userId = req.user!.userId;
      const currentUserDetails = await this.userRepository.findUserById(userId);

      if (!currentUserDetails) {
        throw new HttpError("User not found", 404);
      }

      if (!currentUserDetails.profilePicture) {
        throw new HttpError("Profile picture not found", 404);
      }

      await deleteObjectFromS3(currentUserDetails.profilePicture);

      await this.userRepository.updateUser(userId, {
        profilePicture: "",
      });

      return "Profile picture deleted successfully";
    } catch (error: any) {
      throw new HttpError(
        error?.message ?? "Failed to delete profile picture",
        error?.statusCode || 500
      );
    }
  }

  async getAllEmployeesByOrganization(organizationId: string) {
    try {
      const organization =
        await this.organizationRepository.findOrganizationById(organizationId);
      if (!organization) {
        throw new HttpError("Organization not found", 404);
      }
      return this.employeeRepository.findEmployeesByOrganizationId(
        organizationId
      );
    } catch (error: any) {
      console.error("Error fetching employees........:", error?.stack);
      throw new HttpError(
        error?.message ?? "Failed to fetch employees.",
        error?.statusCode || 500
      );
    }
  }

  async toggleUserRole(req: Request) {
    try {
      const userId = req.params.userId;
      const role = req.user!.role;
      if (role !== UserRole.ORGANIZATION) {
        throw new HttpError("You are not authorized", 403);
      }
      const user = await this.userRepository.findUserById(userId);
      if (!user) {
        throw new HttpError("User not found", 404);
      }

      let newRole;
      if (user.role === UserRole.MANAGER) {
        newRole = UserRole.EMPLOYEE;
      } else if (user.role === UserRole.EMPLOYEE) {
        newRole = UserRole.MANAGER;
      } else {
        throw new HttpError("Invalid user role", 400);
      }

      await this.userRepository.updateUser(userId, { role: newRole });
      return "User role updated successfully";
    } catch (error: any) {
      throw new HttpError(
        error?.message ?? "Failed to update user role",
        error?.statusCode || 500
      );
    }
  }

  async changePassword(req: Request) {
    try {
      const userId = req.user!.userId;
      const { password } = req.body;

      // Password strength validation
      const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\[\]{};':"\\|,.<>\/?~-])[A-Za-z\d!@#$%^&*()_+\[\]{};':"\\|,.<>\/?~-]{8,}$/;
      
        if (!passwordRegex.test(password)) {
        throw new HttpError(
          "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character",
          400
        );
      }

      const user = await this.userRepository.findUserById(userId);
      if (!user) {
        throw new HttpError("User not found", 404);
      }
      await this.userRepository.updateUser(userId, { password });
      return "Password updated successfully";
    } catch (error: any) {
      throw new HttpError(
        error?.message ?? "Failed to update password",
        error?.statusCode || 500
      );
    }
  }
}
