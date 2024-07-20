import { Request } from "express";
import { BugRepository } from "../repositories/BugRepository";
import { HttpError } from "../utils/responseHandler";
import { plainToClass } from "class-transformer";
import { BugDTO } from "../models/dto/BugDTO";
import { validateDTO } from "../utils/validateDTO";
import { ProjectRepository } from "../repositories/ProjectRepository";
import { UserProjectRepository } from "../repositories/UserProjectRepository";
import { generatePresignedUrl } from "../utils/uploadFiles";

export class BugService {
  private bugRepository: BugRepository;
  private projectRepository: ProjectRepository;
  private userProjectRepository: UserProjectRepository;

  constructor() {
    this.bugRepository = new BugRepository();
    this.projectRepository = new ProjectRepository();
    this.userProjectRepository = new UserProjectRepository();
  }

  async createBug(req: Request) {
    try {
      const userId = req.user!.userId;
      const bugData = req.body;
      const imageKeys = req.body.imageKeys;
      bugData.createdBy = userId;
      bugData.image = imageKeys;
      const projectId = bugData.projectId;
      await this.projectRepository.findProjectById(projectId);

      await this.userProjectRepository.isUserAssignedToProject(
        userId,
        projectId
      );

      const bugDTO = plainToClass(BugDTO, bugData);
      await validateDTO(bugDTO);
      const createdBug = await this.bugRepository.createBug(bugDTO);

      // Generate pre-signed URLs for each image
      const imageUrls = await Promise.all(
        imageKeys.map((key: string) => generatePresignedUrl(key))
      );

      createdBug.image = imageUrls;

      // Include the pre-signed URLs in the response
      return createdBug;
    } catch (error: any) {
      throw new HttpError(
        error?.message ?? "Error creating bug",
        error?.statusCode ?? 500
      );
    }
  }

  async findBugsByProjectId(req: Request) {
    try {
      const projectId = req.params.projectId;
      await this.projectRepository.findProjectById(projectId);
      return await this.bugRepository.findBugsByProjectId(projectId);
    } catch (error: any) {
      throw new HttpError(
        error?.message ?? "Error finding bugs for the project",
        error?.statusCode ?? 500
      );
    }
  }

  async findBugById(req: Request) {
    try {
      const bugId = req.params.bugId;
      const userId = req.user!.userId;
      const bug = await this.bugRepository.findBugById(bugId, userId);
      if (!bug) {
        throw new HttpError("Bug not found", 404);
      }
      return bug;
    } catch (error: any) {
      throw new HttpError(
        error?.message ?? "Error finding bug by ID",
        error?.statusCode ?? 500
      );
    }
  }

  async findBugsAssignedToUsers(userIds: string[]) {
    try {
      return await this.bugRepository.findBugsAssignedToUsers(userIds);
    } catch (error: any) {
      throw new HttpError(
        error?.message ?? "Error finding bugs assigned to user",
        error?.statusCode ?? 500
      );
    }
  }

  async findBugsCreatedByUsers(userIds: string[]) {
    try {
      return await this.bugRepository.findBugsCreatedByUsers(userIds);
    } catch (error: any) {
      throw new HttpError(
        error?.message ?? "Error finding bugs created by user",
        error?.statusCode ?? 500
      );
    }
  }

  async findAllBugs(req: Request) {
    try {
      const userId = req.user!.userId;
      return await this.bugRepository.findAllBugs(userId);
    } catch (error: any) {
      throw new HttpError(
        error?.message ?? "Error finding all bugs",
        error?.statusCode ?? 500
      );
    }
  }
}
