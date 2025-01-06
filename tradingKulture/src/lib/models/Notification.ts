// models/Notification.ts
import mongoose from 'mongoose';

export enum NotificationType {
  LEAD_STATUS_UPDATE = 'LEAD_STATUS_UPDATE',
  SALE_RECORDED = 'SALE_RECORDED',
  KIT_REQUEST = 'KIT_REQUEST',
}

const notificationSchema = new mongoose.Schema({
  type: { type: String, enum: Object.values(NotificationType), required: true }, // e.g., 'LEAD_STATUS_UPDATE', 'SALE_RECORDED', 'KIT_REQUEST'
  message: { type: String, required: true }, // Detailed message about the operation
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Partner who performed the operation
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' }, // Optional: Related lead
  saleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale' }, // Optional: Related sale
  kitRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'KitRequest' }, // Optional: Related kit request
  timestamp: { type: Date, default: Date.now }, // When the operation occurred
});

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

export default Notification;