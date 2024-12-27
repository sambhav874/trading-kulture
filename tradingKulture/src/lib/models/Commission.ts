import mongoose from 'mongoose'

const CommissionSchema = new mongoose.Schema({
  
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  slabs: {
    '0-30': { type: Number, default: 0 },
    '30-70': { type: Number, default: 0 },
    '70-100': { type: Number, default: 0 },
  },
})

export default mongoose.models.Commission || mongoose.model('Commission', CommissionSchema)
