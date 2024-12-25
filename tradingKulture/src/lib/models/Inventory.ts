import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    distributed: {
      type: Number,
      required: true,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    unitPrice: {
      type: Number,
      required: true
    },
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true // Add index for better query performance
    },
    status: {
      type: String,
      enum: ['available', 'allocated', 'distributed'],
      default: 'available'
    }
  }, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });

// Virtual populate for partner details
inventorySchema.virtual('partner', {
  ref: 'User',
  localField: 'partnerId',
  foreignField: '_id',
  justOne: true
});

const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);

export { Inventory };