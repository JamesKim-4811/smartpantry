import { query, execute } from "../queryHelper";
import { Notification, CreateNotificationInput } from "../models";

export const notificationRepository = {
  findByUser(userId: number, unreadOnly = false): Notification[] {
    const sql = unreadOnly
      ? "SELECT * FROM Notification WHERE user_id = ? AND is_read = 0 ORDER BY created_at DESC"
      : "SELECT * FROM Notification WHERE user_id = ? ORDER BY created_at DESC";
    return query<Notification>(sql, [userId]);
  },

  markRead(notificationId: number): void {
    execute(
      "UPDATE Notification SET is_read = 1 WHERE notification_id = ?",
      [notificationId]
    );
  },

  create(input: CreateNotificationInput): number {
    return execute(
      "INSERT INTO Notification (user_id, message, created_at, is_read) VALUES (?, ?, ?, 0)",
      [input.user_id, input.message, new Date().toISOString()]
    );
  },
};
