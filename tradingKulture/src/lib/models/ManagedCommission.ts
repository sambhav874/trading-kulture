import mongoose from 'mongoose';

const SaleDataSchema = new mongoose.Schema({
  saleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale',
    required: true,
  },
  firstMonthSubscription: {
    type: String,
    enum: ['yes', 'no'],
    required: true,
  },
  amountChargedFirstMonth: {
    type: Number,
    default: null,
  },
  renewalSecondMonth: {
    type: String,
    enum: ['yes', 'no'],
    required: true,
  },
  amountChargedSecondMonth: {
    type: Number,
    default: null,
  },
  commission: {
    type: Number,
    required: true,
  },
});

const ManagedCommissionSchema = new mongoose.Schema({
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  currentSlab: {
    type: String,
    enum: ['0-30', '30-70', '70-100'],
    default: '0-30',
  },

  salesData: [SaleDataSchema],
  totalCommission: {
    type: Number,
    default: 0,
  },
});

export default mongoose.models.ManagedCommission || mongoose.model('ManagedCommission', ManagedCommissionSchema);

