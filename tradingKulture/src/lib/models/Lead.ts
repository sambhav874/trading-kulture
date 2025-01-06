// lib/models/Lead.ts
import mongoose from 'mongoose'

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mobileNo: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  platform: {
    type: String,
    required: true,
    enum: ['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'YouTube'],
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'successful', 'lost'],
    default: 'new',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  address: {
    type: String,
    default: '',
  },
  pincode: {
    type: Number,
    default: 0,
  },
  state: {
    type: String,
    default: '',
  },
})
  

const Lead = mongoose.models.Lead || mongoose.model('Lead', leadSchema)

export default Lead