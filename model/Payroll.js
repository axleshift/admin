import mongoose from 'mongoose';

// Define the schema with all the fields from your sample data
const payrollSchema = new mongoose.Schema({
  // Using the original id as _id for MongoDB
  _id: Number,
  employee_id: {
    type: String,
    required: true,
    index: true
  },
  user_id: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  department: String,
  job_position: String,
  base_salary: {
    type: mongoose.Schema.Types.Decimal128,
    get: v => v ? parseFloat(v.toString()) : null
  },
  daily_rate: {
    type: mongoose.Schema.Types.Decimal128,
    get: v => v ? parseFloat(v.toString()) : null
  },
  monthly_rate: {
    type: mongoose.Schema.Types.Decimal128,
    get: v => v ? parseFloat(v.toString()) : null
  },
  gross_salary: {
    type: mongoose.Schema.Types.Decimal128,
    get: v => v ? parseFloat(v.toString()) : null
  },
  tax: {
    type: mongoose.Schema.Types.Decimal128,
    get: v => v ? parseFloat(v.toString()) : null,
    default: 0
  },
  bonus: {
    type: mongoose.Schema.Types.Decimal128,
    get: v => v ? parseFloat(v.toString()) : null,
    default: 0
  },
  deduction: {
    type: mongoose.Schema.Types.Decimal128,
    get: v => v ? parseFloat(v.toString()) : null,
    default: 0
  },
  benefits_total: {
    type: mongoose.Schema.Types.Decimal128,
    get: v => v ? parseFloat(v.toString()) : null,
    default: 0
  },
  net_salary: {
    type: mongoose.Schema.Types.Decimal128,
    get: v => v ? parseFloat(v.toString()) : null
  },
  total_regular_hours: {
    type: mongoose.Schema.Types.Decimal128,
    get: v => v ? parseFloat(v.toString()) : null
  },
  total_overtime_hours: {
    type: mongoose.Schema.Types.Decimal128,
    get: v => v ? parseFloat(v.toString()) : null,
    default: 0
  },
  total_overtime_amount: {
    type: mongoose.Schema.Types.Decimal128,
    get: v => v ? parseFloat(v.toString()) : null,
    default: 0
  },
  paid_leave_amount: {
    type: mongoose.Schema.Types.Decimal128,
    get: v => v ? parseFloat(v.toString()) : null,
    default: 0
  },
  total_late_hours: {
    type: mongoose.Schema.Types.Decimal128,
    get: v => v ? parseFloat(v.toString()) : null,
    default: 0
  },
  total_undertime_hours: {
    type: mongoose.Schema.Types.Decimal128,
    get: v => v ? parseFloat(v.toString()) : null,
    default: 0
  },
  days_worked: mongoose.Schema.Types.Mixed,
  benefits_details: mongoose.Schema.Types.Mixed,
  working_days: {
    type: mongoose.Schema.Types.Decimal128,
    get: v => v ? parseFloat(v.toString()) : null
  },
  start_date: Date,
  end_date: Date,
  payroll_status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processing', 'completed'],
    default: 'pending'
  },
  year: {
    type: Number,
    required: true,
    index: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
    index: true
  },
  status: {
    type: String,
    default: 'Pending'
  },
  period: {
    type: Number,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: Date,
  // Add a field to track when this record was synced from HR3
  last_synced: {
    type: Date,
    default: Date.now
  }
}, {
  // This ensures virtual getters are applied when converting to JSON
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true },
  // This prevents MongoDB from adding __v field
  versionKey: false,
  // Don't automatically add createdAt and updatedAt fields
  timestamps: false
});

// Index for common queries
payrollSchema.index({ year: 1, month: 1, employee_id: 1 });
payrollSchema.index({ payroll_status: 1 });

// Virtual for full period identifier (e.g., "2025-02-1")
payrollSchema.virtual('payPeriodId').get(function() {
  return `${this.year}-${this.month.toString().padStart(2, '0')}-${this.period}`;
});

// Static method to find payrolls by date range
payrollSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    start_date: { $gte: new Date(startDate) },
    end_date: { $lte: new Date(endDate) }
  });
};

// Static method to find payrolls by employee
payrollSchema.statics.findByEmployee = function(employeeId) {
  return this.find({ employee_id: employeeId }).sort({ year: -1, month: -1, period: -1 });
};

// Instance method to calculate total deductions
payrollSchema.methods.getTotalDeductions = function() {
  return parseFloat(this.tax.toString()) + 
         parseFloat(this.deduction.toString());
};

// Middleware to update the updated_at field
payrollSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

payrollSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updated_at: new Date() });
  this.set({ last_synced: new Date() });
  next();
});

// Create and export the model
const Payroll = mongoose.model('Payroll', payrollSchema);

export default Payroll;