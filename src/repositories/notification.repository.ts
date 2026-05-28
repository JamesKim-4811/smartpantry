import prisma from "../db";
import { Notification, CreateNotificationInput } from "../models";

export const notificationRepository = {
  async findByUser(userId: number, unreadOnly = false): Promise<Notification[]> {
    const rows = await prisma.notification.findMany({
      where: { user_id: userId, ...(unreadOnly ? { is_read: false } : {}) },
      orderBy: { created_at: "desc" },
    });
    return rows.map((r) => ({
      notification_id: r.notification_id,
      user_id: r.user_id,
      message: r.message,
      created_at: r.created_at,
      is_read: r.is_read,
    }));
  },

  async markRead(notificationId: number): Promise<void> {
    await prisma.notification.update({
      where: { notification_id: notificationId },
      data: { is_read: true },
    });
  },

  async create(input: CreateNotificationInput): Promise<number> {
    const row = await prisma.notification.create({
      data: {
        user_id: input.user_id,
        message: input.message,
        created_at: new Date().toISOString(),
        is_read: false,
      },
    });
    return row.notification_id;
  },
};
