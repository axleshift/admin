import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const saltRounds = 10;
const plainPassword = '123123';

const hashedPassword1 = bcrypt.hashSync(plainPassword, saltRounds);
const hashedPassword2 = bcrypt.hashSync(plainPassword, saltRounds);
const hashedPassword3 = bcrypt.hashSync(plainPassword, saltRounds);
const hashedPassword4 = bcrypt.hashSync(plainPassword, saltRounds);

const generateObjectId = () => new mongoose.Types.ObjectId();

// Users
export const users = [
  {
    name: 'Admin One',
    email: 'admin1@example.com',
    password: hashedPassword1,  // Use the hashed password
    phoneNumber: '+1-555-123-4567',
    role: 'admin',
    username: 'ad1234567890',
  },
  {
    name: 'Admin Two',
    email: 'admin2@example.com',
    password: hashedPassword1,
    phoneNumber: '+1-555-123-4568',
    role: 'admin',
    username: 'ad2345678901',
  },
  {
    name: 'Manager One',
    email: 'manager1@example.com',
    password: hashedPassword2,
    phoneNumber: '+1-555-456-7890',
    role: 'manager',
    username: 'ma3456789012',
  },
  {
    name: 'Manager Two',
    email: 'manager2@example.com',
    password: hashedPassword2,
    phoneNumber: '+1-555-456-7891',
    role: 'manager',
    username: 'ma4567890123',
  },
  {
    name: 'Employee One',
    email: 'employee1@example.com',
    password: hashedPassword3,
    phoneNumber: '+1-555-987-6543',
    role: 'employee',
    username: 'em5678901234',
  },
  {
    name: 'Employee Two',
    email: 'employee2@example.com',
    password: hashedPassword3,
    phoneNumber: '+1-555-987-6544',
    role: 'employee',
    username: 'em6789012345',
  },
  {
    name: 'Employee Three',
    email: 'employee3@example.com',
    password: hashedPassword3,
    phoneNumber: '+1-555-987-6545',
    role: 'employee',
    username: 'em7890123456',
  },
  {
    name: 'Employee Four',
    email: 'employee4@example.com',
    password: hashedPassword3,
    phoneNumber: '+1-555-987-6546',
    role: 'employee',
    username: 'em8901234567',
  },
  {
    name: 'Manager Three',
    email: 'manager3@example.com',
    password: hashedPassword2,
    phoneNumber: '+1-555-456-7892',
    role: 'manager',
    username: 'ma5678901234',
  },
  {
    name: 'Admin Three',
    email: 'admin3@example.com',
    password: hashedPassword1,
    phoneNumber: '+1-555-123-4569',
    role: 'admin',
    username: 'ad3456789012',
  },
];

export const mockLogisticsData = [
  {
    freightId: 'FRT001',
    receivingDate: '2024-10-01',
    dispatchDate: '2024-10-02',
    origin: 'New York',
    destination: 'San Francisco',
    carrier: 'XYZ Logistics',
    status: 'in transit',
    loadOptimization: {
      vehicleId: 'VH123',
      utilization: 80,
      route: 'Highway 101',
      estimatedTimeArrival: '2024-10-04',
      optimizationPlan: {
        strategy: 'Stacking strategy for maximum space utilization',
        cargoArrangement: 'Heavier items at the bottom, fragile items on top',
        additionalNotes: 'Use cargo nets for securing fragile items.',
      },
    },
    trackingNumber: '987654321',
    realTimeNotifications: [
      { notification: 'Freight has departed from New York', date: '2024-10-02' },
      { notification: 'Freight is passing through Phoenix, AZ', date: '2024-10-03' },
    ],
    currentLocation: 'Phoenix, AZ',
    employeeId: '670f3546e065cd0bac0a2817', // Added employee ID
  },
  {
    freightId: 'FRT002',
    receivingDate: '2024-10-03',
    dispatchDate: '2024-10-04',
    origin: 'Chicago',
    destination: 'Los Angeles',
    carrier: 'ABC Freight',
    status: 'delayed',
    loadOptimization: {
      vehicleId: 'VH456',
      utilization: 90,
      route: 'I-90',
      estimatedTimeArrival: '2024-10-06',
      optimizationPlan: {
        strategy: 'Dynamic load adjustments based on real-time data',
        cargoArrangement: 'Compact items loaded to minimize air gaps',
        additionalNotes: 'Re-evaluate load after each stop due to weather conditions.',
      },
    },
    trackingNumber: '123456789',
    realTimeNotifications: [
      { notification: 'Freight delayed due to weather', date: '2024-10-05' },
    ],
    currentLocation: 'Chicago, IL',
    employeeId: '670f3546e065cd0bac0a2818', // Added employee ID
  },
  {
    freightId: 'FRT003',
    receivingDate: '2024-09-29',
    dispatchDate: '2024-09-30',
    origin: 'Houston',
    destination: 'Miami',
    carrier: 'FastTrack Shipping',
    status: 'delivered',
    loadOptimization: {
      vehicleId: 'VH789',
      utilization: 70,
      route: 'I-10',
      estimatedTimeArrival: '2024-10-01',
      optimizationPlan: {
        strategy: 'Load based on delivery sequence to minimize stops',
        cargoArrangement: 'Organized by delivery priority',
        additionalNotes: 'Consider traffic patterns in Miami for final delivery.',
      },
    },
    trackingNumber: '456789123',
    realTimeNotifications: [
      { notification: 'Freight delivered at Miami', date: '2024-10-01' },
    ],
    currentLocation: 'Miami, FL',
    employeeId: '670f3546e065cd0bac0a2819', // Added employee ID
  },
  {
    freightId: 'FRT004',
    receivingDate: '2024-10-05',
    dispatchDate: '2024-10-06',
    origin: 'Seattle',
    destination: 'Denver',
    carrier: 'Prime Movers',
    status: 'pending',
    loadOptimization: {
      vehicleId: 'VH321',
      utilization: 85,
      route: 'I-25',
      estimatedTimeArrival: '2024-10-08',
      optimizationPlan: {
        strategy: 'Pre-planning load based on expected delivery conditions',
        cargoArrangement: 'Balanced weight distribution for highway travel',
        additionalNotes: 'Ensure proper tie-downs for all items.',
      },
    },
    trackingNumber: '654321987',
    realTimeNotifications: [
      { notification: 'Freight is pending for dispatch', date: '2024-10-05' },
    ],
    currentLocation: 'Seattle, WA',
    employeeId: '670f3546e065cd0bac0a2820', // Added employee ID
  },
  {
    freightId: 'FRT005',
    receivingDate: '2024-10-02',
    dispatchDate: '2024-10-03',
    origin: 'Boston',
    destination: 'Atlanta',
    carrier: 'Speedy Carriers',
    status: 'in transit',
    loadOptimization: {
      vehicleId: 'VH654',
      utilization: 75,
      route: 'I-95',
      estimatedTimeArrival: '2024-10-07',
      optimizationPlan: {
        strategy: 'Utilizing modular containers for mixed cargo',
        cargoArrangement: 'Loading by size and fragility',
        additionalNotes: 'Monitor weight limits for bridge crossings.',
      },
    },
    trackingNumber: '321987654',
    realTimeNotifications: [
      { notification: 'Freight has departed from Boston', date: '2024-10-03' },
      { notification: 'Freight is passing through Washington, DC', date: '2024-10-05' },
    ],
    currentLocation: 'Atlanta, GA',
    employeeId: '670f3546e065cd0bac0a2821', // Added employee ID
  },
  {
    freightId: 'FRT006',
    receivingDate: '2024-10-04',
    dispatchDate: '2024-10-05',
    origin: 'Dallas',
    destination: 'San Antonio',
    carrier: 'Quick Logistics',
    status: 'in transit',
    loadOptimization: {
      vehicleId: 'VH888',
      utilization: 60,
      route: 'I-35',
      estimatedTimeArrival: '2024-10-06',
      optimizationPlan: {
        strategy: 'Utilizing local routes to avoid traffic',
        cargoArrangement: 'Loaded to ensure safety during transit',
        additionalNotes: 'Check for road closures before departure.',
      },
    },
    trackingNumber: '222333444',
    realTimeNotifications: [
      { notification: 'Freight dispatched', date: '2024-10-05' },
    ],
    currentLocation: 'Dallas, TX',
    employeeId: '670f3546e065cd0bac0a2822', // Added employee ID
  },
  {
    freightId: 'FRT007',
    receivingDate: '2024-10-01',
    dispatchDate: '2024-10-02',
    origin: 'Phoenix',
    destination: 'Las Vegas',
    carrier: 'Express Freight',
    status: 'delivered',
    loadOptimization: {
      vehicleId: 'VH555',
      utilization: 85,
      route: 'I-10',
      estimatedTimeArrival: '2024-10-01',
      optimizationPlan: {
        strategy: 'Fast delivery with priority cargo',
        cargoArrangement: 'Carefully loaded to prevent shifting',
        additionalNotes: 'Keep an eye on delivery timeframes.',
      },
    },
    trackingNumber: '777888999',
    realTimeNotifications: [
      { notification: 'Freight delivered in Las Vegas', date: '2024-10-01' },
    ],
    currentLocation: 'Las Vegas, NV',
    employeeId: '670f3546e065cd0bac0a2823', // Added employee ID
  },
  {
    freightId: 'FRT008',
    receivingDate: '2024-10-02',
    dispatchDate: '2024-10-03',
    origin: 'Miami',
    destination: 'Orlando',
    carrier: 'Transport Co.',
    status: 'pending',
    loadOptimization: {
      vehicleId: 'VH444',
      utilization: 70,
      route: 'I-95',
      estimatedTimeArrival: '2024-10-05',
      optimizationPlan: {
        strategy: 'Maximizing space with light cargo',
        cargoArrangement: 'Loosely packed for easy unloading',
        additionalNotes: 'Prepare for a short travel time.',
      },
    },
    trackingNumber: '000111222',
    realTimeNotifications: [
      { notification: 'Freight is pending for dispatch', date: '2024-10-02' },
    ],
    currentLocation: 'Miami, FL',
    employeeId: '670f3546e065cd0bac0a2824', // Added employee ID
  },
];


export const employee = [
  {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "Logistics Coordinator",
      "jobDescription": "Manages the transportation and delivery of goods.",
      "dateOfJoining": "2022-01-15T00:00:00Z",
      "attendance": [
          { "date": "2024-10-01", "status": "present" },
          { "date": "2024-10-02", "status": "absent" },
          { "date": "2024-10-03", "status": "present" }
      ],
      "performance": [
          { "reviewDate": "2023-06-01", "rating": 4, "comments": "Efficient handling of shipping schedules." },
          { "reviewDate": "2024-06-01", "rating": 5, "comments": "Exceptional problem-solving during logistical challenges." }
      ],
      "offboarding": {
          "exitInterviewDate": null,
          "reasonForLeaving": null,
          "feedback": null
      },
      "selfService": {
          "profileUpdated": true,
          "lastUpdated": "2024-10-01T00:00:00Z"
      }
  },
  {
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com",
      "role": "Freight Manager",
      "jobDescription": "Oversees freight operations and coordinates shipping activities.",
      "dateOfJoining": "2021-03-22T00:00:00Z",
      "attendance": [
          { "date": "2024-10-01", "status": "present" },
          { "date": "2024-10-02", "status": "present" },
          { "date": "2024-10-03", "status": "leave" }
      ],
      "performance": [
          { "reviewDate": "2023-06-01", "rating": 5, "comments": "Excellent management of freight costs and schedules." },
          { "reviewDate": "2024-06-01", "rating": 4, "comments": "Good communication with shipping partners." }
      ],
      "offboarding": {
          "exitInterviewDate": null,
          "reasonForLeaving": null,
          "feedback": null
      },
      "selfService": {
          "profileUpdated": true,
          "lastUpdated": "2024-10-01T00:00:00Z"
      }
  },
  {
      "firstName": "Alice",
      "lastName": "Johnson",
      "email": "alice.johnson@example.com",
      "role": "Supply Chain Analyst",
      "jobDescription": "Analyzes supply chain operations to improve efficiency.",
      "dateOfJoining": "2023-05-10T00:00:00Z",
      "attendance": [
          { "date": "2024-10-01", "status": "present" },
          { "date": "2024-10-02", "status": "present" },
          { "date": "2024-10-03", "status": "present" }
      ],
      "performance": [
          { "reviewDate": "2023-12-01", "rating": 4, "comments": "Strong analytical skills, providing valuable insights." }
      ],
      "offboarding": {
          "exitInterviewDate": null,
          "reasonForLeaving": null,
          "feedback": null
      },
      "selfService": {
          "profileUpdated": false,
          "lastUpdated": null
      }
  }
];
