// models/Notification.ts
import mongoose from 'mongoose';

export enum PartnerNotificationType {
    LEAD_ALLOTED = 'LEAD_ALLOTED',
    KITS_DISTRIBUTED = 'KITS_DISTRIBUTED',
    KIT_REQUEST_APPROVAL = 'KIT_REQUEST_APPROVAL',
}

const notificationSchema = new mongoose.Schema({
    type: { type: String, enum: Object.values(PartnerNotificationType), required: true },
    message: { type: String, required: true },
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    kitDistributionId: { type: mongoose.Schema.Types.ObjectId, ref: 'KitDistribution' },
    kitRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'KitRequest' },
    timestamp: { type: Date, default: Date.now },
});

const PartnerNotification = mongoose.models.PartnerNotification || mongoose.model('PartnerNotification', notificationSchema);

export default PartnerNotification;