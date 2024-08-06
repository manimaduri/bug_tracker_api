import { plainToClass } from "class-transformer";
import { ProjectDTO } from "../models/dto/ProjectDTO";
import { EmployeeRepository } from "../repositories/EmployeeRepository";
import { OrganizationRepository } from "../repositories/OrganizationRepository";
import { ProjectRepository } from "../repositories/ProjectRepository";
import { HttpError } from "../utils/responseHandler";
import { Request } from "express";
import { validateDTO } from "../utils/validateDTO";
import { UserProjectRepository } from "../repositories/UserProjectRepository";
import { getSequelizeInstance } from "../models";
import { UserRole } from "../models/dto/UserDTO";
import { deleteObjectFromS3, generatePresignedUrl } from "../utils/uploadFiles";

export class ProjectService {
  private projectRepository: ProjectRepository;
  private organizationRepository: OrganizationRepository;
  private employeeRepository: EmployeeRepository;
  private userProjectRepository: UserProjectRepository;

  constructor() {
    this.projectRepository = new ProjectRepository();
    this.organizationRepository = new OrganizationRepository();
    this.employeeRepository = new EmployeeRepository();
    this.userProjectRepository = new UserProjectRepository();
  }

  async createProject(req: Request) {
    const sequelize = getSequelizeInstance(); // Obtain the Sequelize instance
    const transaction = await sequelize.transaction(); // Start a transaction
    try {
      const userId = req.user!.userId;
      const role = req.user!.role;
      const logo = req.body.imageKey;

      if (!(role === UserRole.MANAGER || role === UserRole.ORGANIZATION)) {
        throw new HttpError("Unauthorized access", 403);
      }

      const organization =
        await this.organizationRepository.findOrganizationByUserId(userId); // Assuming the User model has a relation to Organization
      if (!organization) {
        throw new Error("User organization not found");
      }
      const project = req.body;
      project.logo = logo;
      const projectDTO = plainToClass(ProjectDTO, project);
      await validateDTO(projectDTO);

      projectDTO.organizationId = organization.id;
      projectDTO.createdBy = userId;
      const createdProject = await this.projectRepository.createProject(
        projectDTO,
        transaction
      );
      let userIds = req.body.userIds;
      if (typeof userIds === "string") {
        userIds = JSON.parse(userIds); // Parse userIds if it's a JSON string
      }
      if (!Array.isArray(userIds)) {
        userIds = []; // Ensure userIds is an array
      }
      userIds.push(userId); // Add the creator to the list of users
      if (userIds?.length > 0) {
        for (const userId of userIds) {
          await this.userProjectRepository.associateUserWithProject(
            userId,
            createdProject.id,
            transaction
          );
        }
      }

      if (logo) {
        const presignedUrl = await generatePresignedUrl(logo);
        createdProject.logo = presignedUrl;
      }

      await transaction.commit(); // Commit the transaction

      return createdProject;
    } catch (error: any) {
      try {
        await transaction.rollback(); // Roll back the transaction in case of an error
      } catch (rollbackError) {
        console.error("Transaction rollback failed:", rollbackError);
      }

      if (req.body.imageKey) {
        try {
          await deleteObjectFromS3(req.body.imageKey);
        } catch (s3Error) {
          console.error("Failed to delete object from S3:", s3Error);
        }
      }

      console.error("Error creating project:", error);
      throw new HttpError(
        error?.message ?? `Error creating project`,
        error?.statusCode ?? 500
      );
    }
  }

  async updateProject(req: Request) {
    try {
      const userId = req.user!.userId;
      const projectId = req.params.projectId;
      const {
        id,
        createdAt,
        updatedAt,
        logo,
        createdBy,
        organizationId,
        ...projectData
      } = req.body;
      const currentProject = await this.projectRepository.findProjectById(
        projectId
      );
      if (!currentProject) {
        throw new HttpError("Project not found", 404);
      }
      if (currentProject.createdBy !== userId) {
        throw new HttpError("Unauthorized access", 403);
      }
      const projectDTO = plainToClass(ProjectDTO, projectData);
      await validateDTO(projectDTO);
      await this.userProjectRepository.isUserAssignedToProject(
        userId,
        projectId
      );
      return await this.projectRepository.updateProject(projectId, projectDTO);
    } catch (error: any) {
      throw new HttpError(
        error?.message ?? "Failed to update project",
        error?.statusCode || 500
      );
    }
  }

  async getProjectById(req: Request) {
    try {
      const projectId = req.params.projectId;
      const userId = req.user!.userId;
      await this.userProjectRepository.isUserAssignedToProject(
        userId,
        projectId
      );
      return await this.projectRepository.findProjectById(projectId);
    } catch (error: any) {
      throw new HttpError(
        error?.message ?? "Failed to fetch project.",
        error?.statusCode || 500
      );
    }
  }

  async getAllProjectsByOrganization(organizationId: string) {
    try {
      const organization =
        await this.organizationRepository.findOrganizationById(organizationId);
      if (!organization) {
        throw new HttpError("Organization not found", 404);
      }
      return this.projectRepository.findProjectsByOrganizationId(
        organizationId
      );
    } catch (error: any) {
      throw new HttpError(
        error?.message ?? "Failed to fetch projects.",
        error?.statusCode || 500
      );
    }
  }

  //all projects
  async getAllProjects(req: Request) {
    try {
      return await this.userProjectRepository.findProjectsByUserId(
        req.user!.userId
      );
    } catch (error: any) {
      throw new HttpError(
        error?.message ?? "Failed to fetch projects.",
        error?.statusCode || 500
      );
    }
  }
}
