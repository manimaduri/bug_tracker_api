import { Project } from "../models/Project";
import { HttpError } from "../utils/responseHandler";

export class ProjectRepository {
  async createProject(
    projectData: Partial<Project>,
  ) {
    try {
      const result = await Project.create(projectData);
      return result;
    } catch (error) {
      throw new HttpError(`Error creating project`);
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
