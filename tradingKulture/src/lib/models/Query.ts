import mongoose from "mongoose";

const querySchema = new mongoose.Schema({
    query: {
      type: String,
      required: true,
    },
    reply: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
  });
  
  const Query =mongoose.models.Query || mongoose.model('Query', querySchema);

  
export default Query;