import { Request } from "express";
import { CommentsRepository } from "../repositories/CommentRepository";
import { HttpError } from "../utils/responseHandler";
import { plainToClass } from "class-transformer";
import { CommentDTO, UpdateCommentDTO } from "../models/dto/CommentDTO";
import { validateDTO } from "../utils/validateDTO";
import { BugRepository } from "../repositories/BugRepository";
import { UserProjectRepository } from "../repositories/UserProjectRepository";
export class CommentsService {
  private commentsRepository: CommentsRepository;
  private bugRepository: BugRepository;
  private userProjectRepository: UserProjectRepository;
  constructor() {
    this.commentsRepository = new CommentsRepository();
    this.bugRepository = new BugRepository();
    this.userProjectRepository = new UserProjectRepository();
  }

  async createComment(req: Request) {
    try {
      const userId = req.user!.userId;
      const commentData = plainToClass(CommentDTO, req.body);
      await validateDTO(commentData);
      commentData.userId = userId;
      const project = await this.bugRepository.findProjectByBugId(commentData.bugId);
      await this.userProjectRepository.isUserAssignedToProject(userId, project.id);
      const comment = await this.commentsRepository.createComment(commentData);
      return comment;
    } catch (error: any) {
      throw new HttpError(
        error?.message ?? "Error creating comment",
        error?.statusCode ?? 500
      );
    }
  }

  //update
  async updateComment(req: Request) {
    try {
      const userId = req.user!.userId;
      const commentId = req.body.commentId;
      const commentData = plainToClass(UpdateCommentDTO, req.body);
      await validateDTO(commentData);
      const comment = await this.commentsRepository.findCommentById(commentId);
      if (!comment) {
        throw new HttpError("Comment not found", 404);
      }
      if (comment.userId !== userId) {
        throw new HttpError("Unauthorized access", 403);
      }
      return await this.commentsRepository.updateComment(commentId, {comment:commentData.comment});
    } catch (error: any) {
      throw new HttpError(
        error?.message ?? "Error updating comment",
        error?.statusCode ?? 500
      );
    }
  }

  //get comments by bug id from req
  async getCommentsByBugId(req: Request) {
    try {
      const bugId = req.params.bugId;
      const userId = req.user!.userId;
      const project = await this.bugRepository.findProjectByBugId(bugId);
      await this.userProjectRepository.isUserAssignedToProject(userId, project.id);

      const comments = await this.commentsRepository.getCommentsByBugId(bugId);
      return comments;
    } catch (error: any) {
      throw new HttpError(
        error?.message ?? "Error fetching comments",
        error?.statusCode ?? 500
      );
    }
  }

  async deleteComment(req: Request) {
    try {
      const userId = req.user!.userId;
      const commentId = req.params.commentId;
      const comment = await this.commentsRepository.findCommentById(commentId);
      if (!comment) {
        throw new HttpError("Comment not found", 404);
      }
      if (comment.userId !== userId) {
        throw new HttpError("Unauthorized access", 403);
      }
      await this.commentsRepository.deleteComment(commentId);
      return { message: "Comment deleted successfully" };
    } catch (error: any) {
      throw new HttpError(
        error?.message ?? "Error deleting comment",
        error?.statusCode ?? 500
      );
    }
  }
  
}
