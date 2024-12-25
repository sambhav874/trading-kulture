
import mongoose from 'mongoose';

const kitDistributionSchema = new mongoose.Schema({
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  kitsSent: {
    type: Number,
    required: true,
    min: 1
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'delivered', 'cancelled'],
    default: 'pending'
  },
  trackingNumber: {
    type: String
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  }
});




const KitDistribution = mongoose.models.KitDistribution || mongoose.model('KitDistribution', kitDistributionSchema);

export {  KitDistribution }