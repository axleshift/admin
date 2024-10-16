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

// Products
export const products = [
  {
    _id: "649b2c16a86f85baf01b1a65",
    name: "20ft Cargo Container",
    price: 2999.99,
    description: "Standard 20ft cargo container for freight transport",
    category: "freightsea",
  },
  {
    _id: "649b2c16a86f85baf01b1a66",
    name: "Heavy Duty Pallet Jack",
    price: 499.99,
    description: "Manual pallet jack for handling heavy cargo",
    category: "freightland",
  },
  {
    _id: "649b2c16a86f85baf01b1a67",
    name: "Forklift (Electric)",
    price: 24999.99,
    description: "Electric forklift for warehouse and cargo operations",
    category: "freightland",
  },
  {
    _id: "649b2c16a86f85baf01b1a68",
    name: "Cargo Straps Set",
    price: 79.99,
    description: "Set of durable cargo straps for securing loads",
    category: "freightair",
  },
  {
    _id: "649b2c16a86f85baf01b1a69",
    name: "Air Freight Pallet",
    price: 199.99,
    description: "Lightweight aluminum pallet for air freight shipments",
    category: "freightair",
  },
  {
    _id: "649b2c16a86f85baf01b1a70",
    name: "Cargo Loading Ramp",
    price: 1599.99,
    description: "Heavy-duty ramp for loading cargo into trucks",
    category: "freightland",
  },
  {
    _id: "649b2c16a86f85baf01b1a71",
    name: "40ft High Cube Container",
    price: 4999.99,
    description: "40ft high cube container for extra large cargo shipments",
    category: "freightsea",
  },
  {
    _id: "649b2c16a86f85baf01b1a72",
    name: "Air Cargo Net",
    price: 299.99,
    description: "Strong cargo net designed for securing air freight",
    category: "freightair",
  },
  {
    _id: "649b2c16a86f85baf01b1a73",
    name: "Freight Dollies",
    price: 899.99,
    description: "Dollies used for moving heavy freight in warehouses",
    category: "freightland",
  },
  {
    _id: "649b2c16a86f85baf01b1a74",
    name: "Refrigerated Cargo Container",
    price: 9999.99,
    description: "Temperature-controlled container for perishable goods",
    category: "freightsea",
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
