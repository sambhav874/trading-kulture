import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {type: String,
  } ,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: String,
  role: {
    type: String,
    enum: ['admin', 'partner', 'user' , 'support'],
    default: 'user'
  },
  isProfileComplete: {
    type: Boolean ,
    default : false,
  },
  googleId: String,
  emailVerified: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Partner specific fields
  city: String,
  state: String ,
  pincode: Number ,
  phoneNumber: String,
  
  
});

export default mongoose.models.User || mongoose.model('User', UserSchema);


