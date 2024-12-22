import mongoose from 'mongoose'

const SaleSchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true,
  },
  quantity: Number,
  amount: Number,
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Sale || mongoose.model('Sale', SaleSchema)

