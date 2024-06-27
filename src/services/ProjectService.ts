import { plainToClass } from "class-transformer";
import { ProjectDTO } from "../models/dto/ProjectDTO";
import { EmployeeRepository } from "../repositories/EmployeeRepository";
import { OrganizationRepository } from "../repositories/OrganizationRepository";
import { ProjectRepository } from "../repositories/ProjectRepository";
import { HttpError } from "../utils/responseHandler";
import { Request } from "express";
import { validateDTO } from "../utils/validateDTO";
import { UserProjectRepository } from "../repositories/UserProjectRepository";
import { User } from "../models/User";
import { Organization } from "../models/Organization";

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
    try {
      const userId = req.user!.userId;
      // Fetch the user's organization ID from the User model
    const user = await User.findByPk(userId, {
      include: [{ model: Organization }],
    });

    const organizationId = user?.organization?.id; // Assuming the User model has a relation to Organization
    if (!organizationId) {
      throw new Error('User organization not found');
    }

      const projectDTO = plainToClass(ProjectDTO,req.body);
      await validateDTO(projectDTO);

      projectDTO.createdBy = organizationId;
      const createdProject = await this.projectRepository.createProject(projectDTO);
      const userIds = req.body.userIds;
      if(userIds){
        for(const userId of userIds){
          await this.userProjectRepository.associateUserWithProject(userId, createdProject.id);
        }
      }
      return createdProject;
    } catch (error: any) {
      throw new HttpError(error?.message ?? `Error creating project`);
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
}
