import { notificationRepository } from "../repositories/notification.repository";
import { CreateNotificationInput } from "../models";

export const notificationService = {
  getByUser(userId: number, unreadOnly = false) {
    return notificationRepository.findByUser(userId, unreadOnly);
  },

  async markRead(notificationId: number) {
    await notificationRepository.markRead(notificationId);
    return { notification_id: notificationId, is_read: true };
  },

  async create(input: CreateNotificationInput) {
    const id = await notificationRepository.create(input);
    return { notification_id: id };
  },
};
