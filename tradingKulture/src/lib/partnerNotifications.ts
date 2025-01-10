
import PartnerNotification from '@/lib/models/PartnerNotification';
import connectDB from './db'; 
import { PartnerNotificationType } from '@/lib/models/PartnerNotification';

export const createPartnerNotification = async (notificationData: {
  type: PartnerNotificationType; 
  message: string;
  partnerId: string;
  leadId?: string;
  kitDistributionId?: string;
  kitRequestId?: string;
}) => {
  try {
    await connectDB(); 
    const notification = new PartnerNotification(notificationData);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating partner notification:', error);
    throw new Error('Failed to create partner notification');
  }
};