import mongoose from "mongoose";

const employeeComplaintSchema = new mongoose.Schema({
    employeeId: { type: String, required: false, default: '' },

    
    employeeEmail:{
        type: String,
        required: true
    },

    employeeUsername: { type: String, required: false, default: '' },
    
    employeeName: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    complaintType: {
        type: String,
        required: true,
        enum: ['Workplace Harassment', 'Pay Issues', 'Working Conditions', 'Management Issues', 'Other']
    },
    complaintText: {
        type: String,
        required: true
    },
    assignedDepartment: {
        type: String,
        enum: ['HR', 'Finance', 'Logistics', 'Core'],
        default: 'HR'
    },
    urgency: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['Pending', 'HR Review', 'Needs AI Review', 'Under Review', 'Resolved', 'Dismissed'],
        default: 'Pending'
    },
    requiresAI: {
        type: Boolean,
        default: false
    },
    resolutionText: {
        type: String
    },
    hrNotes: {
        type: String
    },
    resolutionReference: {
        type: String
    },
    actionItems: [{
        action: String,
        assignedTo: String,
        dueDate: String,
        completed: {
            type: Boolean,
            default: false
        }
    }],
    followUpDate: {
        type: Date
    }
}, { timestamps: true });

const EmployeeComplaint = mongoose.model('EmployeeComplaint', employeeComplaintSchema);
export default EmployeeComplaint;