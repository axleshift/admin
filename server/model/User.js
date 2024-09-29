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
  role: {
    type: String,
    enum: ['user', 'admin', 'manager', 'employee'],
    default: 'user',
    required: true,
  },
  verificationCode: {
    type: String,
    required: true,
  },
});

UserSchema.methods.generateAuthToken = function(){
  const token = jwt.sign({_id: this._id, role: this.role}, process.env.JWT_SECRET, { expiresIn: '7d' });
  return token;
}

const User = mongoose.model('User', UserSchema);
export default User;  // Use export default
