import mongoose from 'mongoose'

const employeeSchema = new mongoose.Schema({
        githubId: String,
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        employeeId: { type: String, required: true, unique: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        role: { type: String, required: true },
        department: { type: String, required: true },
        dateUpdated: { type: Date, default: Date.now }

    
})

export default mongoose.model('Employee', employeeSchema)