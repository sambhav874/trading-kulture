import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  amount: Number,
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  firstMonthSubscription: {
    type: String,
    enum: ['yes', 'no'],
    default: 'no'
  },
  renewalSecondMonth: {
    type: String,
    enum: ['yes', 'no'],
    default: 'no'
  },
  amountChargedFirstMonth: {
    type: Number,
    default: null
  },
  amountChargedSecondMonth: {
    type: Number,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});



const Sale = mongoose.models.Sale || mongoose.model('Sale', saleSchema);

export { Sale };
