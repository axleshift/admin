import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const saltRounds = 10;
const plainPassword = "123123";

const hashedPassword1 = bcryptjs.hashSync(plainPassword, saltRounds);
const hashedPassword2 = bcryptjs.hashSync(plainPassword, saltRounds);
const hashedPassword3 = bcryptjs.hashSync(plainPassword, saltRounds);
const hashedPassword4 = bcryptjs.hashSync(plainPassword, saltRounds);

const generateObjectId = () => new mongoose.Types.ObjectId();

export const users = [
    {
        name: "Admin One",
        email: "admin1@example.com",
        password: "hashedPassword1",
        phoneNumber: "+1-555-123-4567",
        role: "admin",
        username: "ad1234567890",
        department: "HR",
        attendance: [
            { date: new Date("2023-01-02"), status: "present" },
            { date: new Date("2023-01-03"), status: "absent" },
        ],
        performance: [
            { reviewDate: new Date("2023-06-01"), rating: 5, comments: "Outstanding performance" },
        ],
        offboarding: null,
        selfService: {
            profileUpdated: true,
            lastUpdated: new Date("2023-07-01"),
        },
        payroll: { salary: 75000, bonus: 5000, deductions: 2000 },
        compliance: { trainingCompleted: true, complianceDate: new Date("2023-06-01") },
        benefits: { healthInsurance: true, retirementPlan: true, paidLeave: 15 },
    },
    {
        name: "Admin Two",
        email: "admin2@example.com",
        password: "hashedPassword1",
        phoneNumber: "+1-555-123-4568",
        role: "admin",
        username: "ad2345678901",
        department: "Core",
        attendance: [
            { date: new Date("2023-01-04"), status: "present" },
            { date: new Date("2023-01-05"), status: "leave" },
        ],
        performance: [
            { reviewDate: new Date("2023-06-01"), rating: 4, comments: "Great team leader" },
        ],
        offboarding: {
            exitInterviewDate: new Date("2023-09-01"),
            reasonForLeaving: "Career advancement",
            feedback: "Positive experience overall",
        },
        selfService: {
            profileUpdated: false,
            lastUpdated: new Date("2023-06-15"),
        },
        payroll: { salary: 80000, bonus: 6000, deductions: 3000 },
        compliance: { trainingCompleted: false, complianceDate: new Date("2023-06-01") },
        benefits: { healthInsurance: true, retirementPlan: true, paidLeave: 18 },
    },
    {
        name: "Manager One",
        email: "manager1@example.com",
        password: "hashedPassword2",
        phoneNumber: "+1-555-456-7890",
        role: "manager",
        username: "ma3456789012",
        department: "Logistics",
        attendance: [
            { date: new Date("2023-02-01"), status: "present" },
            { date: new Date("2023-02-02"), status: "present" },
        ],
        performance: [
            { reviewDate: new Date("2023-05-01"), rating: 4, comments: "Effective manager" },
        ],
        offboarding: null,
        selfService: {
            profileUpdated: true,
            lastUpdated: new Date("2023-03-10"),
        },
        payroll: { salary: 95000, bonus: 8000, deductions: 2500 },
        compliance: { trainingCompleted: true, complianceDate: new Date("2023-03-01") },
        benefits: { healthInsurance: true, retirementPlan: true, paidLeave: 20 },
    },
    {
        name: "Manager Two",
        email: "manager2@example.com",
        password: "hashedPassword2",
        phoneNumber: "+1-555-456-7891",
        role: "manager",
        username: "ma4567890123",
        department: "Finance",
        attendance: [
            { date: new Date("2023-02-15"), status: "present" },
            { date: new Date("2023-02-16"), status: "absent" },
        ],
        performance: [
            { reviewDate: new Date("2023-07-15"), rating: 3, comments: "Needs improvement in communication" },
        ],
        offboarding: null,
        selfService: {
            profileUpdated: false,
            lastUpdated: new Date("2023-07-10"),
        },
        payroll: { salary: 85000, bonus: 4000, deductions: 1500 },
        compliance: { trainingCompleted: false, complianceDate: new Date("2023-06-15") },
        benefits: { healthInsurance: true, retirementPlan: true, paidLeave: 12 },
    },
    {
        name: "Employee One",
        email: "employee1@example.com",
        password: "hashedPassword3",
        phoneNumber: "+1-555-987-6543",
        role: "employee",
        username: "em5678901234",
        department: "Administrative",
        attendance: [
            { date: new Date("2023-03-01"), status: "present" },
            { date: new Date("2023-03-02"), status: "leave" },
        ],
        performance: [
            { reviewDate: new Date("2023-04-10"), rating: 5, comments: "Exceptional work" },
        ],
        offboarding: null,
        selfService: {
            profileUpdated: true,
            lastUpdated: new Date("2023-03-20"),
        },
        payroll: { salary: 45000, bonus: 2000, deductions: 1000 },
        compliance: { trainingCompleted: true, complianceDate: new Date("2023-03-05") },
        benefits: { healthInsurance: true, retirementPlan: true, paidLeave: 10 },
    },
    {
        name: "Employee Two",
        email: "employee2@example.com",
        password: "hashedPassword3",
        phoneNumber: "+1-555-987-6544",
        role: "employee",
        username: "em6789012345",
        department: "HR",
        attendance: [
            { date: new Date("2023-03-05"), status: "present" },
            { date: new Date("2023-03-06"), status: "absent" },
        ],
        performance: [
            { reviewDate: new Date("2023-06-15"), rating: 4, comments: "Great team player" },
        ],
        offboarding: null,
        selfService: {
            profileUpdated: true,
            lastUpdated: new Date("2023-03-10"),
        },
        payroll: { salary: 50000, bonus: 3000, deductions: 1500 },
        compliance: { trainingCompleted: true, complianceDate: new Date("2023-06-01") },
        benefits: { healthInsurance: true, retirementPlan: true, paidLeave: 14 },
    },
    {
        name: "Employee Three",
        email: "employee3@example.com",
        password: "hashedPassword3",
        phoneNumber: "+1-555-987-6545",
        role: "employee",
        username: "em7890123456",
        department: "Core",
        attendance: [
            { date: new Date("2023-03-07"), status: "present" },
            { date: new Date("2023-03-08"), status: "present" },
        ],
        performance: [
            { reviewDate: new Date("2023-07-10"), rating: 3, comments: "Average performance" },
        ],
        offboarding: null,
        selfService: {
            profileUpdated: false,
            lastUpdated: new Date("2023-05-18"),
        },
        payroll: { salary: 55000, bonus: 2500, deductions: 1000 },
        compliance: { trainingCompleted: true, complianceDate: new Date("2023-04-01") },
        benefits: { healthInsurance: true, retirementPlan: true, paidLeave: 12 },
    },
    {
        name: "Employee Four",
        email: "employee4@example.com",
        password: "hashedPassword3",
        phoneNumber: "+1-555-987-6546",
        role: "employee",
        username: "em8901234567",
        department: "Logistics",
        attendance: [
            { date: new Date("2023-03-09"), status: "present" },
            { date: new Date("2023-03-10"), status: "leave" },
        ],
        performance: [
            { reviewDate: new Date("2023-04-05"), rating: 2, comments: "Needs improvement" },
        ],
        offboarding: null,
        selfService: {
            profileUpdated: false,
            lastUpdated: new Date("2023-04-25"),
        },
        payroll: { salary: 40000, bonus: 1500, deductions: 800 },
        compliance: { trainingCompleted: false, complianceDate: new Date("2023-03-15") },
        benefits: { healthInsurance: true, retirementPlan: false, paidLeave: 8 },
    },
    {
        name: "Manager Three",
        email: "manager3@example.com",
        password: "hashedPassword2",
        phoneNumber: "+1-555-456-7892",
        role: "manager",
        username: "ma5678901234",
        department: "Finance",
        attendance: [
            { date: new Date("2023-02-20"), status: "present" },
            { date: new Date("2023-02-21"), status: "leave" },
        ],
        performance: [
            { reviewDate: new Date("2023-08-01"), rating: 5, comments: "Excellent management skills" },
        ],
        offboarding: null,
        selfService: {
            profileUpdated: true,
            lastUpdated: new Date("2023-08-05"),
        },
        payroll: { salary: 100000, bonus: 10000, deductions: 4000 },
        compliance: { trainingCompleted: true, complianceDate: new Date("2023-07-01") },
        benefits: { healthInsurance: true, retirementPlan: true, paidLeave: 22 },
    },
    {
        name: "Admin Three",
        email: "admin3@example.com",
        password: "hashedPassword1",
        phoneNumber: "+1-555-123-4569",
        role: "admin",
        username: "ad3456789012",
        department: "Administrative",
        attendance: [
            { date: new Date("2023-01-08"), status: "present" },
            { date: new Date("2023-01-09"), status: "absent" },
        ],
        performance: [
            { reviewDate: new Date("2023-05-20"), rating: 4, comments: "Contributes to team goals" },
        ],
        offboarding: {
            exitInterviewDate: new Date("2023-12-15"),
            reasonForLeaving: "Personal reasons",
            feedback: "Positive overall",
        },
        selfService: {
            profileUpdated: true,
            lastUpdated: new Date("2023-07-12"),
        },
        payroll: { salary: 75000, bonus: 5000, deductions: 2000 },
        compliance: { trainingCompleted: true, complianceDate: new Date("2023-05-01") },
        benefits: { healthInsurance: true, retirementPlan: true, paidLeave: 15 },
    },
];

export const newuser = [
    {
      name: "Aarav Mehta",
      email: "aarav.mehta@example.com",
      role: "manager",
      department: "Logistics"
    },
    {
        name:'hrUser1',
        email:'hruser1@gmail.com',
        role:'user',
        department:'HR'
    },
    {
      name: "Fatima Zahra",
      email: "fatima.zahra@example.com",
      role: "admin",
      department: "Finance"
    },
    {
      name: "Mohammed Al-Mansoori",
      email: "mohammed.mansoori@example.com",
      role: "manager",
      department: "HR"
    },
    {
      name: "Sneha Reddy",
      email: "sneha.reddy@example.com",
      role: "manager",
      department: "Core"
    },
    {
      name: "Omar Khaleel",
      email: "omar.khaleel@example.com",
      role: "manager",
      department: "Logistics"
    },
    {
      name: "Zainab Qureshi",
      email: "zainab.qureshi@example.com",
      role: "admin",
      department: "Finance"
    },
    {
      name: "Imran Shaikh",
      email: "imran.shaikh@example.com",
      role: "manager",
      department: "HR"
    },
    {
      name: "Aisha Noor",
      email: "aisha.noor@example.com",
      role: "manager",
      department: "Core"
    },
    {
      name: "Rohan Malhotra",
      email: "rohan.malhotra@example.com",
      role: "superadmin",
      department: "Administrative"
    },
    {
      name: "Nadia Hussein",
      email: "nadia.hussein@example.com",
      role: "superadmin",
      department: "Administrative"
    }
  ];
  
export const sampleProcurementData = [
  {
    title: "Q2 Office Supplies Procurement",
    description: "Quarterly procurement of standard office supplies for all departments including paper, printer cartridges, and stationery.",
    procurementDate: new Date("2025-04-15"),
    requestedBy:"" , // Replace with actual user ID
    department: "Operations",
    products: [
      {
        name: "A4 Paper (500 sheets)",
        quantity: 50,
        unit: "ream",
        unitPrice: 4.25
      },
      {
        name: "Printer Cartridge HP 304XL",
        quantity: 12,
        unit: "piece",
        unitPrice: 29.99
      },
      {
        name: "Ballpoint Pens (Blue)",
        quantity: 100,
        unit: "piece",
        unitPrice: 0.75
      }
    ],
    estimatedCost: 572.75, // (50 * 4.25) + (12 * 29.99) + (100 * 0.75)
    status: "Approved",
    rejectionReason: null,
    deliveryDate: new Date("2025-04-30"),
    requiresRFQ: false
  },
  {
    title: "Laptop Refresh for IT Department",
    description: "Procurement of 15 new developer laptops for the IT department to replace aging hardware.",
    procurementDate: new Date("2025-04-10"),
    requestedBy:"" , // Replace with actual user ID
    department: "IT",
    products: [
      {
        name: "Dell XPS 15 Developer Laptop",
        quantity: 15,
        unit: "piece",
        unitPrice: 1899.99
      },
      {
        name: "Laptop Docking Station",
        quantity: 15,
        unit: "piece",
        unitPrice: 249.99
      }
    ],
    estimatedCost: 32249.70, // (15 * 1899.99) + (15 * 249.99)
    status: "Pending",
    rejectionReason: null,
    deliveryDate: null,
    requiresRFQ: true
  },
  {
    title: "HR Training Materials",
    description: "Procurement of materials for the upcoming employee onboarding and training program.",
    procurementDate: new Date("2025-03-20"),
    requestedBy:"" , // Replace with actual user ID
    department: "HR",
    products: [
      {
        name: "Training Manual Printing",
        quantity: 50,
        unit: "book",
        unitPrice: 12.50
      },
      {
        name: "USB Flash Drive 32GB",
        quantity: 50,
        unit: "piece",
        unitPrice: 8.99
      },
      {
        name: "Employee Welcome Kit",
        quantity: 50,
        unit: "set",
        unitPrice: 25.00
      }
    ],
    estimatedCost: 2324.50, // (50 * 12.50) + (50 * 8.99) + (50 * 25.00)
    status: "Completed",
    rejectionReason: null,
    deliveryDate: new Date("2025-04-01"),
    requiresRFQ: false
  },
  {
    title: "Server Infrastructure Upgrade",
    description: "Procurement of new server hardware to upgrade our primary data center infrastructure.",
    procurementDate: new Date("2025-04-05"),
    requestedBy:"" , // Replace with actual user ID
    department: "IT",
    products: [
      {
        name: "Dell PowerEdge R740 Server",
        quantity: 4,
        unit: "piece",
        unitPrice: 8799.99
      },
      {
        name: "Network Switch 48-Port",
        quantity: 2,
        unit: "piece",
        unitPrice: 2499.99
      },
      {
        name: "UPS System 3000VA",
        quantity: 2,
        unit: "piece",
        unitPrice: 1799.99
      }
    ],
    estimatedCost: 40199.94, // (4 * 8799.99) + (2 * 2499.99) + (2 * 1799.99)
    status: "Approved",
    rejectionReason: null,
    deliveryDate: new Date("2025-05-15"),
    requiresRFQ: true
  },
  {
    title: "Office Furniture for New Finance Department",
    description: "Procurement of desks, chairs, and storage cabinets for the newly expanded finance department.",
    procurementDate: new Date("2025-03-15"),
    requestedBy:"" , // Replace with actual user ID
    department: "Finance",
    products: [
      {
        name: "Executive Desk",
        quantity: 8,
        unit: "piece",
        unitPrice: 649.99
      },
      {
        name: "Ergonomic Office Chair",
        quantity: 8,
        unit: "piece",
        unitPrice: 349.99
      },
      {
        name: "Filing Cabinet",
        quantity: 4,
        unit: "piece",
        unitPrice: 199.99
      }
    ],
    estimatedCost: 8799.84, // (8 * 649.99) + (8 * 349.99) + (4 * 199.99)
    status: "Rejected",
    rejectionReason: "Budget constraints require postponement to next quarter",
    deliveryDate: null,
    requiresRFQ: true
  },
  {
    title: "Logistics Department Vehicle Maintenance",
    description: "Quarterly maintenance and parts replacement for logistics fleet vehicles.",
    procurementDate: new Date("2025-04-18"),
    requestedBy:"" , // Replace with actual user ID
    department: "Logistics",
    products: [
      {
        name: "Vehicle Oil Change Service",
        quantity: 12,
        unit: "service",
        unitPrice: 49.99
      },
      {
        name: "Vehicle Tire Replacement",
        quantity: 8,
        unit: "set",
        unitPrice: 599.99
      },
      {
        name: "Brake Pad Replacement",
        quantity: 4,
        unit: "set",
        unitPrice: 149.99
      }
    ],
    estimatedCost: 5599.72, // (12 * 49.99) + (8 * 599.99) + (4 * 149.99)
    status: "Pending",
    rejectionReason: null,
    deliveryDate: null,
    requiresRFQ: false
  },
  {
    title: "Annual Software License Renewals",
    description: "Renewal of enterprise software licenses including Microsoft 365, Adobe Creative Cloud, and accounting software.",
    procurementDate: new Date("2025-04-22"),
    requestedBy:"" , // Replace with actual user ID
    department: "IT",
    products: [
      {
        name: "Microsoft 365 Business Premium (Annual)",
        quantity: 150,
        unit: "license",
        unitPrice: 219.99
      },
      {
        name: "Adobe Creative Cloud Team (Annual)",
        quantity: 25,
        unit: "license",
        unitPrice: 599.99
      },
      {
        name: "QuickBooks Enterprise (Annual)",
        quantity: 10,
        unit: "license",
        unitPrice: 899.99
      }
    ],
    estimatedCost: 47998.25, // (150 * 219.99) + (25 * 599.99) + (10 * 899.99)
    status: "Approved",
    rejectionReason: null,
    deliveryDate: new Date("2025-05-01"),
    requiresRFQ: false
  },
  {
    title: "Procurement Department Reference Materials",
    description: "Purchase of updated procurement guides, reference books and training materials for the procurement team.",
    procurementDate: new Date("2025-04-08"),
    requestedBy:"" , // Replace with actual user ID
    department: "Procurement",
    products: [
      {
        name: "Procurement Strategy Guide 2025",
        quantity: 5,
        unit: "book",
        unitPrice: 89.99
      },
      {
        name: "Supply Chain Management Manual",
        quantity: 5,
        unit: "book",
        unitPrice: 79.99
      },
      {
        name: "Procurement Software Training (Online)",
        quantity: 10,
        unit: "license",
        unitPrice: 199.99
      }
    ],
    estimatedCost: 2849.75, // (5 * 89.99) + (5 * 79.99) + (10 * 199.99)
    status: "Completed",
    rejectionReason: null,
    deliveryDate: new Date("2025-04-20"),
    requiresRFQ: false
  },
  {
    title: "Office Security System Upgrade",
    description: "Installation of new security cameras, access control systems, and alarm upgrades for all office locations.",
    procurementDate: new Date("2025-03-25"),
    requestedBy:"" , // Replace with actual user ID
    department: "Operations",
    products: [
      {
        name: "HD Security Camera System (16 cameras)",
        quantity: 3,
        unit: "system",
        unitPrice: 2499.99
      },
      {
        name: "Access Control Terminal",
        quantity: 12,
        unit: "piece",
        unitPrice: 349.99
      },
      {
        name: "Security Alarm System",
        quantity: 3,
        unit: "system",
        unitPrice: 1299.99
      }
    ],
    estimatedCost: 13099.85, // (3 * 2499.99) + (12 * 349.99) + (3 * 1299.99)
    status: "Pending",
    rejectionReason: null,
    deliveryDate: null,
    requiresRFQ: true
  },
  {
    title: "Employee Wellness Program Supplies",
    description: "Procurement of fitness equipment and wellness materials for the company's new employee wellness initiative.",
    procurementDate: new Date("2025-04-12"),
    requestedBy:"" , // Replace with actual user ID
    department: "HR",
    products: [
      {
        name: "Yoga Mat",
        quantity: 30,
        unit: "piece",
        unitPrice: 24.99
      },
      {
        name: "Resistance Band Set",
        quantity: 30,
        unit: "set",
        unitPrice: 19.99
      },
      {
        name: "Wellness Program Guide",
        quantity: 100,
        unit: "book",
        unitPrice: 9.99
      }
    ],
    estimatedCost: 1848.70, // (30 * 24.99) + (30 * 19.99) + (100 * 9.99)
    status: "Approved",
    rejectionReason: null,
    deliveryDate: new Date("2025-04-30"),
    requiresRFQ: false
  }
];

export const sampleInvoices = [
  {
    invoiceNumber: "INV-2025-001",
    trackingId: "TRK001",
    firstName: "John",
    lastName: "Doe",
    customerId: "CUST001",
    email: "john.doe@example.com",
    phone: "+1-555-123-4567",
    deliveryDate: new Date("2025-05-15"),
    discounts: 50.00,
    dueDate: new Date("2025-05-30"),
    address: "123 Main St, Anytown, CA 94123",
    products: [
      {
        name: "Wireless Headphones",
        quantity: 2,
        price: 129.99,
        total: 259.98
      },
      {
        name: "Phone Charger",
        quantity: 1,
        price: 24.99,
        total: 24.99
      }
    ],
    selectedCurrency: "USD",
    status: "Pending",
    totalAmount: 234.97, // After discount
    paymentMethod: "Credit Card",
    qrCode: "qr://invoice/INV2025001",
    notes: "Please leave package at front door"
  },
  {
    invoiceNumber: "INV-2025-002",
    trackingId: "TRK002",
    firstName: "Jane",
    lastName: "Smith",
    customerId: "CUST002",
    email: "jane.smith@example.com",
    phone: "+1-555-987-6543",
    deliveryDate: new Date("2025-05-10"),
    discounts: 0,
    dueDate: new Date("2025-05-20"),
    address: "456 Oak Ave, Somewhere, NY 10001",
    products: [
      {
        name: "Laptop",
        quantity: 1,
        price: 999.99,
        total: 999.99
      },
      {
        name: "Laptop Bag",
        quantity: 1,
        price: 49.99,
        total: 49.99
      },
      {
        name: "Mouse",
        quantity: 1,
        price: 29.99,
        total: 29.99
      }
    ],
    selectedCurrency: "USD",
    status: "Shipped",
    totalAmount: 1079.97,
    paymentMethod: "PayPal",
    qrCode: "qr://invoice/INV2025002",
    notes: "Call before delivery"
  },
  {
    invoiceNumber: "INV-2025-003",
    trackingId: "TRK003",
    firstName: "Robert",
    lastName: "Johnson",
    customerId: "CUST003",
    email: "robert.johnson@example.com",
    phone: "+1-555-321-7890",
    deliveryDate: new Date("2025-05-22"),
    discounts: 100.00,
    dueDate: new Date("2025-06-05"),
    address: "789 Pine Rd, Elsewhere, TX 75001",
    products: [
      {
        name: "Smart TV",
        quantity: 1,
        price: 599.99,
        total: 599.99
      },
      {
        name: "Soundbar",
        quantity: 1,
        price: 199.99,
        total: 199.99
      },
      {
        name: "HDMI Cable",
        quantity: 2,
        price: 15.99,
        total: 31.98
      }
    ],
    selectedCurrency: "USD",
    status: "Delivered",
    totalAmount: 731.96, // After discount
    paymentMethod: "Bank Transfer",
    qrCode: "qr://invoice/INV2025003",
    notes: "Installation service included"
  },
  {
    invoiceNumber: "INV-2025-004",
    trackingId: "TRK004",
    firstName: "Emily",
    lastName: "Williams",
    customerId: "CUST004",
    email: "emily.williams@example.com",
    phone: "+1-555-654-0987",
    deliveryDate: new Date("2025-05-25"),
    discounts: 25.00,
    dueDate: new Date("2025-06-10"),
    address: "321 Maple Dr, Nowhere, FL 33101",
    products: [
      {
        name: "Coffee Maker",
        quantity: 1,
        price: 149.99,
        total: 149.99
      },
      {
        name: "Coffee Beans (1kg)",
        quantity: 2,
        price: 24.99,
        total: 49.98
      }
    ],
    selectedCurrency: "USD",
    status: "Processing",
    totalAmount: 174.97, // After discount
    paymentMethod: "Credit Card",
    qrCode: "qr://invoice/INV2025004",
    notes: "Gift wrapping requested"
  },
  {
    invoiceNumber: "INV-2025-005",
    trackingId: "TRK005",
    firstName: "Michael",
    lastName: "Brown",
    customerId: "CUST005",
    email: "michael.brown@example.com",
    phone: "+1-555-789-4561",
    deliveryDate: new Date("2025-06-01"),
    discounts: 75.00,
    dueDate: new Date("2025-06-15"),
    address: "654 Cedar St, Anyplace, WA 98001",
    products: [
      {
        name: "Office Chair",
        quantity: 1,
        price: 249.99,
        total: 249.99
      },
      {
        name: "Desk Lamp",
        quantity: 1,
        price: 59.99,
        total: 59.99
      },
      {
        name: "Mousepad",
        quantity: 2,
        price: 19.99,
        total: 39.98
      },
      {
        name: "Desk Organizer",
        quantity: 1,
        price: 34.99,
        total: 34.99
      }
    ],
    selectedCurrency: "USD",
    status: "Pending",
    totalAmount: 309.95, // After discount
    paymentMethod: "Apple Pay",
    qrCode: "qr://invoice/INV2025005",
    notes: "Please call for delivery instructions"
  }
];

