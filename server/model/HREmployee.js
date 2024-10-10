import mongoose from 'mongoose';

const HREmployeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['HR Manager', 'HR Assistant', 'Recruiter', 'Payroll Specialist', 'Other'],
  },
  department: {
    type: String,
    default: 'Human Resources',
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  hireDate: {
    type: Date,
    default: Date.now,
  },
  salary: {
    type: Number,
    required: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
  },
  status: {
    type: String,
    enum: ['Active', 'On Leave', 'Resigned', 'Terminated'],
    default: 'Active',
  },
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HREmployee',
  },
}, { timestamps: true });

const HREmployee = mongoose.model('HREmployee', HREmployeeSchema);

export default  HREmployee;
