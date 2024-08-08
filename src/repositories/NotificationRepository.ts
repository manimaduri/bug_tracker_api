import { Notification } from "../models/Notification";
import { HttpError } from "../utils/responseHandler";

export class NotificationRepository {
  async createNotification(userId: string, type: string, message: string, referenceId: string): Promise<Notification> {
    try {
      const notification = await Notification.create({
        userId,
        type,
        message,
        read: false,
        referenceId,
      });
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new HttpError('Error creating notification');
    }
  }

  async updateNotification(id: string, updates: Partial<Notification>): Promise<Notification | null> {
    try {
      const notification = await Notification.findByPk(id);
      if (!notification) {
        throw new Error('Notification not found');
      }

      await notification.update(updates);
      return notification;
    } catch (error) {
      console.error('Error updating notification:', error);
      throw new HttpError('Error updating notification');
    }
  }
}