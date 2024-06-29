import { Request } from "express";
import { BugRepository } from "../repositories/BugRepository";
import { HttpError } from "../utils/responseHandler";
import { plainToClass } from "class-transformer";
import { BugDTO } from "../models/dto/BugDTO";
import { validateDTO } from "../utils/validateDTO";
import { ProjectRepository } from "../repositories/ProjectRepository";

export class BugService {
  private bugRepository: BugRepository;
  private projectRepository: ProjectRepository;

  constructor() {
    this.bugRepository = new BugRepository();
    this.projectRepository = new ProjectRepository();
  }

  async createBug(req: Request) {
    try {
      const userId = req.user!.userId;
      const bugData = req.body;
      bugData.createdBy = userId;
      const projectId = bugData.projectId;
      await this.projectRepository.findProjectById(
        projectId
      );
      
      const bugDTO = plainToClass(BugDTO, bugData);
      await validateDTO(bugDTO);
      return await this.bugRepository.createBug(bugDTO);
    } catch (error: any) {
      throw new HttpError(
        error?.message ?? "Error creating bug",
        error?.statusCode ?? 500
      );
    }
  }

  async findBugsByProjectId(projectId: string) {
    try {
      return await this.bugRepository.findBugsByProjectId(projectId);
    } catch (error: any) {
      throw new HttpError(
        error?.message ?? "Error finding bugs for the project",
        error?.statusCode ?? 500
      );
    }
  }
}
