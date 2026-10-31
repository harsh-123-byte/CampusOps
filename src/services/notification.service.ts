import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";
import mongoose from "mongoose";

export class NotificationService {
  static async createNotification({
    userId,
    title,
    message,
    type = "INFO",
    link,
  }: {
    userId: string | mongoose.Types.ObjectId;
    title: string;
    message: string;
    type?: "INFO" | "SUCCESS" | "WARNING" | "DANGER";
    link?: string;
  }) {
    await connectDB();
    return Notification.create({
      userId: new mongoose.Types.ObjectId(userId.toString()),
      title,
      message,
      type,
      link,
      isRead: false,
    });
  }

  static async getUserNotifications(userId: string, limit: number = 20) {
    await connectDB();
    return Notification.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  static async getUnreadCount(userId: string) {
    await connectDB();
    return Notification.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      isRead: false,
    });
  }

  static async markAsRead(notificationId: string, userId: string) {
    await connectDB();
    return Notification.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(notificationId),
        userId: new mongoose.Types.ObjectId(userId),
      },
      { isRead: true },
      { new: true }
    );
  }

  static async markAllAsRead(userId: string) {
    await connectDB();
    return Notification.updateMany(
      { userId: new mongoose.Types.ObjectId(userId), isRead: false },
      { isRead: true }
    );
  }
}
