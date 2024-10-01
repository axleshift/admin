import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'manager', 'employee'],
    default: 'user',
    required: true,
  },

});



const User = mongoose.model('User', UserSchema);
export default User; // Use export default
