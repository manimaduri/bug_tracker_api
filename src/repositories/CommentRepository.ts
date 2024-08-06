import { Comment } from "../models/Comment";
import { Employee } from "../models/Employee";
import { Organization } from "../models/Organization";
import { User } from "../models/User";
import { HttpError } from "../utils/responseHandler";

export class CommentsRepository{
  async createComment(commentData: Partial<Comment>) {
    try {
      const result = await Comment.create(commentData);
      return result;
    } catch (error) {
      throw new HttpError(`Error creating comment: ${error}`);
    }
  }
  async updateComment(commentId: string, comment: Partial<Comment>) {
    try {
      const result = await Comment.update(comment, {
        where: { id: commentId },
        returning: true,
      });
      return result[1][0];
    } catch (error) {
      throw new HttpError(`Error updating comment: ${error}`);
    }
  }

  //findCommentById
  async findCommentById(commentId: string) {
    try {
      const comment = await Comment.findByPk(commentId);
      return comment;
    } catch (error) {
      throw new HttpError(`Error fetching comment: ${error}`);
    }
  }

  //get comments bu bug id
  async getCommentsByBugId(bugId: string) {
    try {
      const comments = await Comment.findAll({
        where: { bugId },
        include: [
          {
            model: User,
            attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
            include: [
              {
                model: Employee,
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                required: false
              },
              {
                model: Organization,
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                required: false
              }
            ]
          }
        ]
      });
      return comments;
    } catch (error) {
      console.error(`Error fetching comments for bugId ${bugId}:`, error);
      throw new HttpError(`Error fetching comments: ${error}`);
    }
  }

  async deleteComment(commentId: string) {
    try {
      const result = await Comment.destroy({ where: { id: commentId } });
      return result;
    } catch (error) {
      console.error(`Error deleting comment ${commentId}:`, error);
      throw new HttpError(`Error deleting comment: ${error}`);
    }
  }
}