import mongoose from "mongoose";

const PartnerDistributionSchema = new mongoose.Schema({
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
    unique: true,
  },
  totalKits: {
    type: Number,
    default: 0,
    required: true,
  },
  lastDistribution: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

const PartnerDistribution = mongoose.model('PartnerDistribution', PartnerDistributionSchema);

export {PartnerDistribution};