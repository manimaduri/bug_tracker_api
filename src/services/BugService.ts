import { Request } from "express";
import { BugRepository } from "../repositories/BugRepository";
import { HttpError } from "../utils/responseHandler";
import { plainToClass } from "class-transformer";
import { BugDTO } from "../models/dto/BugDTO";
import { validateDTO } from "../utils/validateDTO";
import { ProjectRepository } from "../repositories/ProjectRepository";
import { UserProjectRepository } from "../repositories/UserProjectRepository";
import { deleteObjectFromS3, generatePresignedUrl } from "../utils/uploadFiles";

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
      const imageKeys = req.body?.imageKeys;
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

  async updateBug(req: Request) {
    try {
      const userId = req.user!.userId;
      const bugData = req.body;
      const newImageKeys = req.body?.imageKeys;
      const bugId = req.params.bugId;

      // Ensure the user is assigned to the project
      const projectId = bugData.projectId;
      await this.projectRepository.findProjectById(projectId);

      // Validate the bug data
      const bugDTO = plainToClass(BugDTO, bugData);
      await validateDTO(bugDTO);

      // Fetch the existing bug to retain existing image keys if no new images are uploaded
      const existingBug = await this.bugRepository.findBugById(bugId, userId);
      if (!existingBug) {
        throw new HttpError("Bug not found", 404);
      }

      // Check if the user is allowed to update the bug
      if (
        existingBug.createdBy !== userId &&
        existingBug.assignedTo !== userId
      ) {
        throw new HttpError("You are not allowed to update this bug", 403);
      }
      const existingImageKeys = existingBug.image || [];

      // Merge existing image keys with new image keys
      const mergedImageKeys = [...existingImageKeys, ...newImageKeys];

      // Exclude projectId and createdBy from bugDTO
      const { projectId: _, createdBy: __, ...updateData } = bugDTO;

      // Update the bug in the repository
      updateData.image = mergedImageKeys;
      const updatedBug = await this.bugRepository.updateBug(bugId, updateData);

      // Generate pre-signed URLs for each image if new image keys are provided
      if (newImageKeys) {
        const imageUrls = await Promise.all(
          mergedImageKeys.map((key: string) => generatePresignedUrl(key))
        );
        updatedBug.image = imageUrls;
      }

      // Include the pre-signed URLs in the response
      return updatedBug;
    } catch (error: any) {
      throw new HttpError(
        error?.message ?? "Error updating bug",
        error?.statusCode ?? 500
      );
    }
  }

  async deleteImage(req: Request) {
    try {
      const userId = req.user!.userId;
      const { bugId } = req.params;
      const { presignedUrl } = req.body;

      // Validate the presigned URL
      let url;
      try {
        url = new URL(presignedUrl);
      } catch (e) {
        throw new HttpError("Invalid image", 400);
      }
      const imageKey = url.pathname.substring(1); // Assuming the key is the path without the leading '/'

      // Fetch the existing bug
      const existingBug = await this.bugRepository.findBugById(bugId, userId);
      if (!existingBug) {
        throw new HttpError("Bug not found", 404);
      }

      // Check if the user is allowed to update the bug
      if (
        existingBug.createdBy !== userId &&
        existingBug.assignedTo !== userId
      ) {
        throw new HttpError("You are not allowed to update this bug", 403);
      }

      // Remove the image key from the bug's image array
      const updatedImageKeys = existingBug?.image?.filter(
        (key: string) => key !== imageKey
      );

      // Update the bug in the repository
      const updatedBug = await this.bugRepository.updateBug(bugId, {
        image: updatedImageKeys,
      });

      try {
        // Delete the image from S3
        await deleteObjectFromS3(imageKey);
      } catch (s3Error: any) {
        // Log the S3 deletion error for manual intervention
        console.error(`Failed to delete bug image from S3: ${s3Error.message}`);
        // Rollback the database update
        try {
          await this.bugRepository.updateBug(bugId, {
            image: existingBug.image,
          });
        } catch (rollbackError: any) {
          console.error(
            `Failed to rollback delete bug image: ${rollbackError.message}`
          );
          throw new HttpError("Failed to delete bug image", 500);
        }
        throw new HttpError("Failed to delete bug image", 500);
      }

      return updatedBug;
    } catch (error: any) {
      throw new HttpError(
        error?.message ?? "Error deleting image key",
        error?.statusCode ?? 500
      );
    }
  }

  async findBugsByProjectId(req: Request) {
    try {
      const projectId = req.params.projectId;
      await this.projectRepository.findProjectById(projectId);
      await this.userProjectRepository.isUserAssignedToProject(
        req.user!.userId,
        projectId
      );
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

  async findBugsCreatedByUsers(req: Request) {
    try {
      const userIds = req.body.userIds;
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
