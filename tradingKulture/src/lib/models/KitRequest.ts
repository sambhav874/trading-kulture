import mongoose from 'mongoose';

const KitRequestSchema = new mongoose.Schema({
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

export const KitRequest = mongoose.models.KitRequest || mongoose.model('KitRequest', KitRequestSchema);
