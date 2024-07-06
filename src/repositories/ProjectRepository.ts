import { Transaction, UniqueConstraintError } from "sequelize";
import { Bug } from "../models/Bug";
import { Organization } from "../models/Organization";
import { Project } from "../models/Project";
import { HttpError } from "../utils/responseHandler";

export class ProjectRepository {
  async createProject(
    projectData: Partial<Project>,
    transaction?: Transaction
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

  async findProjectsByOrganizationId(createdBy: string) {
    try {
      // Fetch projects and include associated bugs
      const projects = await Project.findAll({
        where: { createdBy },
        include: [
          {
            model: Bug,
            as: "bugs",
            attributes: ["status"],
            required: false, // Include projects even if they have no bugs
          },
          {
            model: Organization,
            // as: 'createdBy',
            // attributes: { exclude: ['password'] },
          },
        ],
      });

      // Map projects to include counts and progress
      const projectsWithDetails = projects.map((project) => {
        const bugs = project.bugs || [];
        const totalBugsCount = bugs.length;
        const openBugsCount = bugs.filter(
          (bug) => bug.status === "Open"
        ).length;
        const progress =
          totalBugsCount > 0
            ? ((totalBugsCount - openBugsCount) / totalBugsCount) * 100
            : 0;

        // Destructure the project object and omit the bugs property
        const { bugs: _, ...projectDetails } = project.toJSON();

        return {
          ...projectDetails,
          totalBugsCount,
          openBugsCount,
          progress,
        };
      });

      return projectsWithDetails;
    } catch (error) {
      console.error("Error finding projects by organization ID:", error);
      throw new HttpError(`Error finding projects by organization ID`);
    }
  }

  async findProjectById(projectId: string) {
    try {
      const project = await Project.findByPk(projectId);
      if (!project) {
        throw new HttpError(`Project not found`, 404);
      }
      return project;
    } catch (error: any) {
      console.error("Error finding project by ID:", error);
      throw new HttpError(
        error?.message ?? `Error finding project by ID...`,
        error?.statusCode ?? 500
      );
    }
  }
}
