import mongoose from 'mongoose';

const kitDistributionSchema = new mongoose.Schema({
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 0
  },
  amountPerKit: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
    default: function() {
      return this.quantity * this.amountPerKit;
    }
  },
  distributionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed'
  },
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate for partner details
kitDistributionSchema.virtual('partner', {
  ref: 'User',
  localField: 'partnerId',
  foreignField: '_id',
  justOne: true
});

// Calculate totalAmount before saving
kitDistributionSchema.pre('save', function(next) {
  if (this.quantity && this.amountPerKit) {
    this.totalAmount = this.quantity * this.amountPerKit;
  }
  next();
});

const KitDistribution = mongoose.models.KitDistribution || mongoose.model('KitDistribution', kitDistributionSchema);

export { KitDistribution };
