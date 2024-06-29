import { Transaction, UniqueConstraintError } from "sequelize";
import { Project } from "../models/Project";
import { HttpError } from "../utils/responseHandler";

export class ProjectRepository {
  async createProject(
    projectData: Partial<Project>, transaction?: Transaction
  ) {
    try {
      const result = await Project.create(projectData, { transaction });
      return result;
    } catch (error) {
      // Check if the error is a unique constraint error
      console.log("Error creating project:", error);
      if (error instanceof UniqueConstraintError) {
        throw new HttpError("Project with given name already exists", 400); // Use appropriate HTTP status code
      } else {
        throw new HttpError(`Error creating project`);
      }
    }
  }

  async findProjectsByOrganizationId(organizationId: string) {
    try {
      const projects = await Project.findAll({ where: { organizationId } });

      return projects;
    } catch (error) {
      console.error("Error finding projects by organization ID:", error)
      throw new HttpError(`Error finding projects by organization ID`);
    }
  }

  async findProjectById(projectId: string) {
    try {
      const project= await Project.findByPk(projectId);
      if(!project) {
        throw new HttpError(`Project not found`, 404); 
      }
      return project;
    } catch (error : any) {
      console.error("Error finding project by ID:", error);
      throw new HttpError(error?.message ?? `Error finding project by ID...`, error?.statusCode ?? 500);
    }
  }
}
