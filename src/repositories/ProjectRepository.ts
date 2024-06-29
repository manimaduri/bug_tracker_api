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
      throw new HttpError(`Error finding projects by organization ID`);
    }
  }
}
