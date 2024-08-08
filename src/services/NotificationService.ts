import { validateDTO } from "../utils/validateDTO";
import { NotificationRepository } from "../repositories/NotificationRepository";
import { NotificationDTO } from "../models/dto/NotificationDTO";
import { plainToClass } from "class-transformer";
import { HttpError } from "../utils/responseHandler";

export class NotificationService {
  private notificationRepository: NotificationRepository;
  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  async createNotification(
    assignedUserId: string,
    type: string,
    message: string,
    referenceId: string
  ) {
    try {
      const notificationData = { assignedUserId, type, message, referenceId };
      const notificationDTO = plainToClass(NotificationDTO, notificationData);
      await validateDTO(notificationDTO);
      return this.notificationRepository.createNotification(
        assignedUserId,
        type,
        message,
        referenceId
      );
    } catch (error: any) {
      console.log("Error creating uuuu:",assignedUserId,"=======", error);
      throw new HttpError(
        error?.message ?? "Error creating notification",
        error?.statusCode ?? 500
      );
    }
  }
}
