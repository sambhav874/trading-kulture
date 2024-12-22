import mongoose from 'mongoose'

const CommissionSchema = new mongoose.Schema({
  sale: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale',
  },
  partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  amount: Number,
  status: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending',
  },
  paidAt: Date,
})

export default mongoose.models.Commission || mongoose.model('Commission', CommissionSchema)

