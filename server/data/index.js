import bcrypt from 'bcrypt';

const saltRounds = 10;
const plainPassword = '123123';


const hashedPassword1 = bcrypt.hashSync(plainPassword, saltRounds);
const hashedPassword2 = bcrypt.hashSync(plainPassword, saltRounds);
const hashedPassword3 = bcrypt.hashSync(plainPassword, saltRounds);
const hashedPassword4 = bcrypt.hashSync(plainPassword, saltRounds);


const generateObjectId = () => new mongoose.Types.ObjectId();

export const users = [
  {
    name: 'Admin One',
    email: 'admin1@example.com',
    password: hashedPassword1,  // Use the hashed password
    phoneNumber: '+1-555-123-4567',
    role: 'admin',
    username: 'ad1234567890'
  },
  {
    name: 'Admin Two',
    email: 'admin2@example.com',
    password: hashedPassword1,  // Use the hashed password
    phoneNumber: '+1-555-123-4568',
    role: 'admin',
    username: 'ad2345678901'
  },
  {
    name: 'Manager One',
    email: 'manager1@example.com',
    password: hashedPassword2,  // Use the hashed password
    phoneNumber: '+1-555-456-7890',
    role: 'manager',
    username: 'ma3456789012'
  },
  {
    name: 'Manager Two',
    email: 'manager2@example.com',
    password: hashedPassword2,  // Use the hashed password
    phoneNumber: '+1-555-456-7891',
    role: 'manager',
    username: 'ma4567890123'
  },
  {
    name: 'Employee One',
    email: 'employee1@example.com',
    password: hashedPassword3,  // Use the hashed password
    phoneNumber: '+1-555-987-6543',
    role: 'employee',
    username: 'em5678901234'
  },
  {
    name: 'Employee Two',
    email: 'employee2@example.com',
    password: hashedPassword3,  // Use the hashed password
    phoneNumber: '+1-555-987-6544',
    role: 'employee',
    username: 'em6789012345'
  },
  {
    name: 'Employee Three',
    email: 'employee3@example.com',
    password: hashedPassword3,  // Use the hashed password
    phoneNumber: '+1-555-987-6545',
    role: 'employee',
    username: 'em7890123456'
  },
  {
    name: 'Employee Four',
    email: 'employee4@example.com',
    password: hashedPassword3,  // Use the hashed password
    phoneNumber: '+1-555-987-6546',
    role: 'employee',
    username: 'em8901234567'
  },
  {
    name: 'Manager Three',
    email: 'manager3@example.com',
    password: hashedPassword2,  // Use the hashed password
    phoneNumber: '+1-555-456-7892',
    role: 'manager',
    username: 'ma5678901234'
  },
  {
    name: 'Admin Three',
    email: 'admin3@example.com',
    password: hashedPassword1,  // Use the hashed password
    phoneNumber: '+1-555-123-4569',
    role: 'admin',
    username: 'ad3456789012'
  }
];


  
// products.js
export const products = [
  { 
    "_id": "649b2c16a86f85baf01b1a65", 
    "name": "20ft Cargo Container", 
    "price": 2999.99, 
    "description": "Standard 20ft cargo container for freight transport", 
    "category": "freightsea"
  },
  { 
    "_id": "649b2c16a86f85baf01b1a66", 
    "name": "Heavy Duty Pallet Jack", 
    "price": 499.99, 
    "description": "Manual pallet jack for handling heavy cargo", 
    "category": "freightland"
  },
  { 
    "_id": "649b2c16a86f85baf01b1a67", 
    "name": "Forklift (Electric)", 
    "price": 24999.99, 
    "description": "Electric forklift for warehouse and cargo operations", 
    "category": "freightland"
  },
  { 
    "_id": "649b2c16a86f85baf01b1a68", 
    "name": "Cargo Straps Set", 
    "price": 79.99, 
    "description": "Set of durable cargo straps for securing loads", 
    "category": "freightair"
  },
  { 
    "_id": "649b2c16a86f85baf01b1a69", 
    "name": "Air Freight Pallet", 
    "price": 199.99, 
    "description": "Lightweight aluminum pallet for air freight shipments", 
    "category": "freightair"
  },
  { 
    "_id": "649b2c16a86f85baf01b1a70", 
    "name": "Cargo Loading Ramp", 
    "price": 1599.99, 
    "description": "Heavy-duty ramp for loading cargo into trucks", 
    "category": "freightland"
  },
  { 
    "_id": "649b2c16a86f85baf01b1a71", 
    "name": "40ft High Cube Container", 
    "price": 4999.99, 
    "description": "40ft high cube container for extra large cargo shipments", 
    "category": "freightsea"
  },
  { 
    "_id": "649b2c16a86f85baf01b1a72", 
    "name": "Air Cargo Net", 
    "price": 299.99, 
    "description": "Strong cargo net designed for securing air freight", 
    "category": "freightair"
  },
  { 
    "_id": "649b2c16a86f85baf01b1a73", 
    "name": "Freight Dollies", 
    "price": 899.99, 
    "description": "Dollies used for moving heavy freight in warehouses", 
    "category": "freightland"
  },
  { 
    "_id": "649b2c16a86f85baf01b1a74", 
    "name": "Refrigerated Cargo Container", 
    "price": 9999.99, 
    "description": "Temperature-controlled container for perishable goods", 
    "category": "freightsea"
  }
];






// orders.js
export const orders = [
  {
      "_id": "649b2c16a86f85baf01b1a75",
      "userId": "649b2c16a86f85baf01b1a55",
      "products": [{ "productId": "649b2c16a86f85baf01b1a65", "quantity": 1 }],
      "totalAmount": 29.99,
      "freight": "air",
      "orderDate": "2024-09-25T10:00:00Z"
  },
  {
      "_id": "649b2c16a86f85baf01b1a76",
      "userId": "649b2c16a86f85baf01b1a56",
      "products": [{ "productId": "649b2c16a86f85baf01b1a67", "quantity": 2 }],
      "totalAmount": 19.98,
      "freight": "land",
      "orderDate": "2024-09-26T12:30:00Z"
  },
  {
      "_id": "649b2c16a86f85baf01b1a77",
      "userId": "649b2c16a86f85baf01b1a57",
      "products": [{ "productId": "649b2c16a86f85baf01b1a68", "quantity": 1 }],
      "totalAmount": 39.99,
      "freight": "sea",
      "orderDate": "2024-09-27T09:15:00Z"
  },
  {
      "_id": "649b2c16a86f85baf01b1a78",
      "userId": "649b2c16a86f85baf01b1a58",
      "products": [{ "productId": "649b2c16a86f85baf01b1a69", "quantity": 3 }],
      "totalAmount": 149.97,
      "freight": "air",
      "orderDate": "2024-09-28T14:20:00Z"
  },
  {
      "_id": "649b2c16a86f85baf01b1a79",
      "userId": "649b2c16a86f85baf01b1a59",
      "products": [{ "productId": "649b2c16a86f85baf01b1a66", "quantity": 1 }],
      "totalAmount": 79.99,
      "freight": "land",
      "orderDate": "2024-09-29T11:45:00Z"
  },
  {
      "_id": "649b2c16a86f85baf01b1a80",
      "userId": "649b2c16a86f85baf01b1a60",
      "products": [{ "productId": "649b2c16a86f85baf01b1a70", "quantity": 1 }],
      "totalAmount": 199.99,
      "freight": "sea",
      "orderDate": "2024-09-30T10:00:00Z"
  },
  {
      "_id": "649b2c16a86f85baf01b1a81",
      "userId": "649b2c16a86f85baf01b1a61",
      "products": [{ "productId": "649b2c16a86f85baf01b1a71", "quantity": 2 }],
      "totalAmount": 51.98,
      "freight": "air",
      "orderDate": "2024-10-01T09:00:00Z"
  },
  {
      "_id": "649b2c16a86f85baf01b1a82",
      "userId": "649b2c16a86f85baf01b1a62",
      "products": [{ "productId": "649b2c16a86f85baf01b1a72", "quantity": 1 }],
      "totalAmount": 89.99,
      "freight": "land",
      "orderDate": "2024-10-02T12:15:00Z"
  },
  {
      "_id": "649b2c16a86f85baf01b1a83",
      "userId": "649b2c16a86f85baf01b1a63",
      "products": [{ "productId": "649b2c16a86f85baf01b1a73", "quantity": 4 }],
      "totalAmount": 63.96,
      "freight": "sea",
      "orderDate": "2024-10-03T15:30:00Z"
  },
  {
      "_id": "649b2c16a86f85baf01b1a84",
      "userId": "649b2c16a86f85baf01b1a64",
      "products": [{ "productId": "649b2c16a86f85baf01b1a74", "quantity": 2 }],
      "totalAmount": 45.98,
      "freight": "air",
      "orderDate": "2024-10-04T08:00:00Z"
  }
];
