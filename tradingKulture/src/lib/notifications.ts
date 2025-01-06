// lib/notifications.ts
import Notification from '@/lib/models/Notification';
import connectDB from './db'; // Your database connection utility
import { NotificationType } from '@/lib/models/Notification';

export const createNotification = async (notificationData: {
  type: NotificationType; // Use the NotificationType enum here
  message: string;
  partnerId: string;
  leadId?: string;
  saleId?: string;
  kitRequestId?: string;
}) => {
  try {
    await connectDB(); // Ensure database connection
    const notification = new Notification(notificationData);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw new Error('Failed to create notification');
  }
};