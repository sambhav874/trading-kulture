import mongoose from 'mongoose'

const KitSchema = new mongoose.Schema({
  name: String,
  description: String,
  quantity: Number,
  price: Number,
})

export default mongoose.models.Kit || mongoose.model('Kit', KitSchema)

