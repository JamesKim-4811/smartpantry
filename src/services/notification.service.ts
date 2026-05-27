import { notificationRepository } from "../repositories/notification.repository";
import { CreateNotificationInput } from "../models";

export const notificationService = {
  getByUser(userId: number, unreadOnly = false) {
    return notificationRepository.findByUser(userId, unreadOnly);
  },

  markRead(notificationId: number) {
    notificationRepository.markRead(notificationId);
    return { notification_id: notificationId, is_read: true };
  },

  create(input: CreateNotificationInput) {
    const id = notificationRepository.create(input);
    return { notification_id: id };
  },
};
