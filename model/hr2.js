import mongoose from 'mongoose'

const TrainingBudgetReport = new mongoose.Schema({
    budgetId: String,
    fiscalYear: String,
    totalBudget: Number,
    amountSpent: Number,
    remainingBudget: Number,
    expensesDetail:[{
            category:String,
            amount: Number,
    }],
    lastUpdated: Date

})

const EmployeeTrainingEngagement = new  mongoose.Schema({
    employeeId: String,          // Unique identifier for the employee
    employeeName: String,        // Employee's name
    trainingSessionId: String,   // Reference to the training session
    completionStatus: String,    // e.g., "Completed", "In Progress"
    engagementScore: Number,     // Engagement level (e.g., 1-100)
    trainingStartDate: Date,     // Start date of training
    trainingCompletionDate: Date,// Completion date
    hoursSpent: Number,          // Hours spent on the training
    feedback: String   
})

const TrainingManagement = new mongoose.Schema({
    programId: String,           // Unique identifier for the training program
  programTitle: String,        // Title of the program
  programDescription: String,  // Description of the training
  trainingType: String,        // Type (e.g., "Online", "In-Person")
  schedule: [                  // Array of scheduled dates and times
    {
      date: Date,              // Training date
      startTime: String,       // Start time
      endTime: String          // End time
    }
  ],
  trainerName: String,         // Trainer's name
  participants: [String],      // Array of employee IDs
  attendanceRecords: [         // Attendance details
    {
      employeeId: String,
      attended: Boolean        // Whether they attended or not
    }
  ],
  trainingMaterials: [String], // URLs or descriptions of resources
  trainingStatus: String       
})

const TalentManagement =new mongoose.Schema( {
    employeeId: String,            // Unique identifier for the employee
    employeeName: String,          // Employee's name
    skills: [String],              // Array of skills
    certifications: [String],      // List of certifications earned
    performanceScore: Number,      // Performance rating (e.g., 1-100)
    careerDevelopmentPlan: String, // Development plan details
    trainingHistory: [String],     // Array of completed training program IDs
    talentClassification: String,  // e.g., "High Potential"
    successionPlanRole: String     // Role the employee is being trained for
})

const LearningManagement = new mongoose.Schema( {
    courseId: String,            // Unique identifier for the course
    courseTitle: String,         // Title of the course
    courseDescription: String,   // Summary of the course content
    learningPath: [String],      // Array of related courses forming a path
    courseDuration: String,      // Estimated time to complete
    enrolledEmployees: [String], // Array of employee IDs
    completionRate: Number,      // Percentage of course completion
    quizResults: [               // Quiz or test results
      {
        employeeId: String,      // Employee who took the quiz
        score: Number            // Quiz score
      }
    ],
    certificatesIssued: [        // List of certificates earned
      {
        employeeId: String,
        certificateId: String
      }
    ],
    platformUsage: [             // Metrics on platform interaction
      {
        employeeId: String,
        loginFrequency: Number,  // Number of logins
        timeSpent: Number        // Total time spent in minutes
      }
    ]
  })
  