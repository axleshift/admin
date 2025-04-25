import schedule from 'node-schedule';
import axios from 'axios';
import Freight from '../model/core1.js';
import Payroll from '../model/Payroll.js';
import LeaveRequest from '../model/LeaveRequest.js';
import JobPosting from '../model/JobPosting.js'; 
import Vehicle from '../model/Vehicle.js'; 
import MonthlySales from '../model/MonthlySales.js';
import Core1Insight from '../model/Core1Insight.js';
import Inventory from '../model/Inventory.js';
// Load environment variables or default values
const EXTERNAL_CORE = process.env.EXTERNAL_CORE?.replace(/\/$/, '') 
const CORE_API_TOKEN = process.env.CORE_API_TOKEN   
const EXTERNAL_HR3 = process.env.EXTERNAL_HR3?.replace(/\/$/, '')  
const EXTERNAL_HR2 = process.env.EXTERNAL_Hr2?.replace(/\/$/, '') 
const HR2_API_KEY = process.env.Hr2_api_key 
const EXTERNAL_LOG1 = process.env.EXTERNAL_LOG1?.replace(/\/$/, '') 
const LOG1_API_KEY = process.env.LOG1_API_KEY 
const EXTERNALFinance = process.env.EXTERNALFinance
const core1 = process.env.EXTERNAL_CORE?.replace(/\/$/, '') 
const core1Token = process.env.CORE_API_TOKEN 
const LOG2_BASE_URL = process.env.EXTERNAL_LOG2;

const FREIGHT_SYNC_INTERVAL = process.env.CORE_SYNC_INTERVAL 
const HR3_SYNC_INTERVAL = process.env.Hr3_SYNC_INTERVAL 
const HR2_SYNC_INTERVAL = process.env.Hr2_SYNC_INTERVAL 
const LOG1_SYNC_INTERVAL = process.env.LOG1_SYNC_INTERVAL 
const FINANCE_SYNC_INTERVAL = process.env.FINANCE_SYNC_INTERVAL
const CORE_SYNC_INTERVAL = process.env.CORE_SYNC_INTERVAL 
const LOG2_SYNC_INTERVAL = process.env.LOG2_SYNC_INTERVAL 
// Function to sync freight data
const syncFreightData = async () => {
  try {
    console.log('Auto-syncing freight data with External Core API...');
    
    const response = await axios.post(
      `${EXTERNAL_CORE}/api/v1/freight/`,
      { page: 1 },
      {
        headers: {
          Authorization: `Bearer ${CORE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const externalData = response.data.results || response.data.data || [];
    if (!Array.isArray(externalData)) {
      console.error('Invalid API response format', response.data);
      return;
    }

    const externalIds = externalData.map(item => item._id);
    let successCount = 0;
    let errorCount = 0;
    const syncedItems = [];

    for (const item of externalData) {
      try {
        if (item.tracking_number === null) {
          item.tracking_number = `GENERATED-${item._id}-${Date.now()}`;
        }

        const updatedItem = await Freight.findOneAndUpdate(
          { _id: item._id },
          item,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        successCount++;
        syncedItems.push(updatedItem);
      } catch (itemError) {
        console.error(`Error syncing freight item ${item._id}:`, itemError.message);
        errorCount++;
      }
    }

    if (successCount > 0) {
      await Freight.deleteMany({ _id: { $nin: externalIds } });
    }

    console.log(`Freight auto-sync completed: ${successCount} items synced, ${errorCount} errors`);
   
  } catch (error) {
    console.error('Error in freight auto-sync:', error.message);
  }
};

// Function to sync payroll data
const syncPayrollData = async () => {
  try {
    console.log('Auto-syncing payroll data with HR3 API...');
    console.log(`Using HR3 endpoint: ${EXTERNAL_HR3}/api/payrolls`);
    
    // Fetch payroll data from the HR3 API
    const response = await axios.get(`${EXTERNAL_HR3}/api/payrolls`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Extract payroll entries from the response
    const data = response.data || {};
    const payrollEntries = data.payrollEntries || data || []; // Handle different response structures
    const count = Array.isArray(payrollEntries) ? payrollEntries.length : 0;


    if (count === 0) {
      console.log('No payroll entries to sync.');
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    const syncedPayrolls = [];

    // Collect all payroll IDs for cleanup later
    const payrollIds = payrollEntries.map((item) => item.id || item._id);

    for (const item of payrollEntries) {
      try {
        const payrollId = item.id || item._id;
        if (!payrollId) {
          console.warn('Skipping payroll item with missing ID:', item);
          continue;
        }

        // Upsert the payroll entry into the database
        const updatedPayroll = await Payroll.findOneAndUpdate(
          { _id: payrollId },
          item,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        successCount++;
        syncedPayrolls.push(updatedPayroll);
      } catch (itemError) {
        console.error(`Error syncing payroll item with ID ${item.id || item._id}:`, itemError.message);
        errorCount++;
      }
    }

    if (successCount > 0) {
      await Payroll.deleteMany({ _id: { $nin: payrollIds } });
    }

    console.log(`Payroll auto-sync completed: ${successCount} items synced, ${errorCount} errors`);

  } catch (error) {
    console.error('Error in payroll auto-sync:', error.message);

    // Detailed error logging for debugging
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Unexpected error:', error.message);
    }
  }
};
const syncLeaveRequests = async () => {
  try {
    if (!EXTERNAL_HR3) {
      console.error("Error: EXTERNAL_HR3 is not defined in the environment variables.");
      return;
    }

    console.log('Auto-syncing leave requests with HR3 API...');
    console.log(`Using HR3 endpoint: ${EXTERNAL_HR3}/api/leave-requests`);

    // Fetch leave requests from the HR3 API
    const response = await axios.get(`${EXTERNAL_HR3}/api/leave-requests`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Extract leave requests from the response
    const leaveRequests = response.data?.leaveRequests || [];
    const count = Array.isArray(leaveRequests) ? leaveRequests.length : 0;



    if (count === 0) {
      console.log('No leave requests to sync.');
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    const syncedLeaveRequests = [];

    // Collect all leave request IDs for cleanup later
    const leaveRequestIds = leaveRequests.map((item) => item.id || item._id);

    for (const item of leaveRequests) {
      try {
        const leaveRequestId = item.id || item._id;
        if (!leaveRequestId) {
          console.warn('Skipping leave request with missing ID:', item);
          continue;
        }

        // Upsert the leave request into the database
        const updatedLeaveRequest = await LeaveRequest.findOneAndUpdate(
          { _id: leaveRequestId },
          item,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        successCount++;
        syncedLeaveRequests.push(updatedLeaveRequest);
      } catch (itemError) {
        console.error(`Error syncing leave request with ID ${item.id || item._id}:`, itemError.message);
        errorCount++;
      }
    }

    if (successCount > 0) {
      // Clean up removed entries
      await LeaveRequest.deleteMany({ _id: { $nin: leaveRequestIds } });
    }

    console.log(`Leave  auto-sync completed: ${successCount} items synced, ${errorCount} errors`);
  } catch (error) {
    console.error('Error in leave requests auto-sync:', error.message);

    // Detailed error logging for debugging
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Unexpected error:', error.message);
    }
  }
};

const syncJobPostings = async () => {
  try {
    const HR2 = process.env.EXTERNAL_Hr2;
    const Api_Key = process.env.Hr2_api_key;

    if (!HR2) {
      console.error("Error: EXTERNAL_Hr2 is not defined in the environment variables.");
      return;
    }

    if (!Api_Key) {
      console.error("Error: Hr2_api_key is not defined in the environment variables.");
      return;
    }

    console.log('Auto-syncing job postings with HR2 API...');
    console.log(`Using HR2 endpoint: ${HR2}request/jobposting/all`);

    const response = await axios.get(`${HR2}request/jobposting/all`, {
      headers: {
        'x-api-key': Api_Key,
        'Content-Type': 'application/json',
      },
    });

    // Extract the job postings array from the response
    const jobPostings = response.data?.data || []; // Correctly extract the `data` field
    const count = Array.isArray(jobPostings) ? jobPostings.length : 0;

    console.log(`Retrieved ${count} job postings from HR2`);

    if (count === 0) {
      console.log('No job postings to sync.');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    const jobPostingIds = jobPostings.map((item) => item._id);

    for (const item of jobPostings) {
      try {
        const jobPostingId = item._id;
        if (!jobPostingId) {
          console.warn('Skipping job posting with missing ID:', item);
          continue;
        }

        await JobPosting.findOneAndUpdate(
          { _id: jobPostingId },
          item,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        successCount++;
      } catch (itemError) {
        console.error(`Error syncing job posting with ID ${item._id}:`, itemError.message);
        errorCount++;
      }
    }

    if (successCount > 0) {
      await JobPosting.deleteMany({ _id: { $nin: jobPostingIds } });
    }

    console.log(`Job postings auto-sync completed: ${successCount} items synced, ${errorCount} errors`);
  } catch (error) {
    console.error('Error in job postings auto-sync:', error.message);

    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Unexpected error:', error.message);
    }
  }
};

// Function to sync LOG1 Vehicle Data
const syncVehicleData = async () => {
  try {
    const LOG1_API = process.env.EXTERNAL_LOG1;
    const LOG1_APIKEY = process.env.LOG1_API_KEY;

    if (!LOG1_API) {
      console.error("Error: EXTERNAL_LOG1 is not defined in the environment variables.");
      return;
    }

    if (!LOG1_APIKEY) {
      console.error("Error: LOG1_API_KEY is not defined in the environment variables.");
      return;
    }

    console.log('Auto-syncing vehicle data with LOG1 API...');
    console.log(`Using LOG1 endpoint: ${LOG1_API}/api/v1/vehicle/all`);

    const response = await axios.get(`${LOG1_API}/api/v1/vehicle/all`, {
      headers: {
        'x-api-key': LOG1_APIKEY,
        'Content-Type': 'application/json',
      },
    });

    // Extract the vehicles array from the response
    const vehicles = response.data?.data || []; // Correctly extract the `data` field
    const count = Array.isArray(vehicles) ? vehicles.length : 0;

    console.log(`Retrieved ${count} vehicles from LOG1`);

    if (count === 0) {
      console.log('No vehicles to sync.');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    const vehicleIds = vehicles.map((item) => item._id);

    for (const item of vehicles) {
      try {
        const vehicleId = item._id;
        if (!vehicleId) {
          console.warn('Skipping vehicle with missing ID:', item);
          continue;
        }

        // Handle null or missing VIN values
        if (!item.vin || item.vin === null) {
          item.vin = `GENERATED-${vehicleId}-${Date.now()}`; // Generate a placeholder VIN
        }

        await Vehicle.findOneAndUpdate(
          { _id: vehicleId },
          item,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        successCount++;
      } catch (itemError) {
        console.error(`Error syncing vehicle with ID ${item._id}:`, itemError.message);
        errorCount++;
      }
    }

    if (successCount > 0) {
      await Vehicle.deleteMany({ _id: { $nin: vehicleIds } });
    }

    console.log(`Vehicle data auto-sync completed: ${successCount} items synced, ${errorCount} errors`);
  } catch (error) {
    console.error('Error in vehicle data auto-sync:', error.message);

    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Unexpected error:', error.message);
    }
  }
};

const syncMonthlySales = async () => {
  try {
    if (!EXTERNALFinance) {
      console.error('External finance URL is not configured');
      return;
    }

    console.log('Auto-syncing monthly sales and revenue data with Finance API...');
    console.log(`Using Finance endpoint: ${EXTERNALFinance}/api/salesAndRevenue/monthly-sales-revenue`);

    // Add timeout to detect if the external system is down
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

    try {
      const response = await fetch(`${EXTERNALFinance}/api/salesAndRevenue/monthly-sales-revenue`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Sync data to the database
      let successCount = 0;
      let errorCount = 0;

      for (const item of data) {
        try {
          await MonthlySales.findOneAndUpdate(
            { _id: item._id }, // Assuming `_id` is the unique identifier
            item,
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
          successCount++;
        } catch (itemError) {
          console.error(`Error syncing monthly sales item with ID ${item._id}:`, itemError.message);
          errorCount++;
        }
      }

      console.log(`Monthly sales auto-sync completed: ${successCount} items synced, ${errorCount} errors`);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Request to external finance system timed out');
        return;
      }
      throw error; // Re-throw for the outer catch block
    }
  } catch (error) {
    console.error('Failed to fetch monthly sales revenue data:', error.message);
  }
};

const syncCore1ShipmentInsights = async () => {
  try {
    console.log('Auto-syncing Core1 shipment insights...');
    console.log(`Using Core1 endpoint: ${core1}/api/v1/insights/shipment-overtime/`);

    let response;
    try {
      response = await axios.post(
        `${core1}/api/v1/insights/shipment-overtime/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${core1Token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (postError) {
      console.warn('POST request failed, falling back to GET request...');
      response = await axios.get(
        `${core1}/api/v1/insights/shipment-overtime/`,
        {
          headers: {
            Authorization: `Bearer ${core1Token}`,
            "Content-Type": "application/json",
          },
        }
      );
    }



    const labels = response.data?.labels || [];
    const data = response.data?.data || [];

    if (labels.length === 0 || data.length === 0) {
      console.log('No shipment insights to sync.');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < labels.length; i++) {
      try {
        const insight = {
          _id: `shipment-${labels[i]}`, // Generate a unique ID based on the label
          type: 'shipment',
          data: data[i],
          label: labels[i],
        };

        await Core1Insight.findOneAndUpdate(
          { _id: insight._id },
          insight,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        successCount++;
      } catch (itemError) {
        console.error(`Error syncing shipment insight for label ${labels[i]}:`, itemError.message);
        errorCount++;
      }
    }

    console.log(`shipment insights auto-sync completed: ${successCount} items synced, ${errorCount} errors`);
  } catch (error) {
    console.error('Error in Core1 shipment insights auto-sync:', error.message);
  }
};

// Function to sync Core1 Insights (Cost Over Time)
const syncCore1CostInsights = async () => {
  try {
    console.log('Auto-syncing Core1 cost insights...');
    console.log(`Using Core1 endpoint: ${core1}/api/v1/insights/cost-overtime/`);

    const response = await axios.get(
      `${core1}/api/v1/insights/cost-overtime/`,
      {
        headers: {
          Authorization: `Bearer ${core1Token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Log the full response to debug the structure

    const labels = response.data?.labels || [];
    const data = response.data?.data || [];

    if (labels.length === 0 || data.length === 0) {
      console.log('No cost insights to sync.');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < labels.length; i++) {
      try {
        const insight = {
          _id: `cost-${labels[i]}`, // Generate a unique ID based on the label
          type: 'cost',
          data: data[i],
          label: labels[i],
        };

        await Core1Insight.findOneAndUpdate(
          { _id: insight._id },
          insight,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        successCount++;
      } catch (itemError) {
        console.error(`Error syncing cost insight for label ${labels[i]}:`, itemError.message);
        errorCount++;
      }
    }

    console.log(`cost insights auto-sync completed: ${successCount} items synced, ${errorCount} errors`);
  } catch (error) {
    console.error('Error in Core1 cost insights auto-sync:', error.message);
  }
};

// Function to sync Core1 Insights (Items Over Time)
const syncCore1ItemInsights = async () => {
  try {
    console.log('Auto-syncing Core1 item insights...');
    console.log(`Using Core1 endpoint: ${core1}/api/v1/insights/items-overtime/`);

    const response = await axios.get(
      `${core1}/api/v1/insights/items-overtime/`,
      {
        headers: {
          Authorization: `Bearer ${core1Token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Log the full response to debug the structure

    const labels = response.data?.labels || [];
    const data = response.data?.data || [];

    if (labels.length === 0 || data.length === 0) {
      console.log('No item insights to sync.');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < labels.length; i++) {
      try {
        const insight = {
          _id: `item-${labels[i]}`, // Generate a unique ID based on the label
          type: 'item',
          data: data[i],
          label: labels[i],
        };

        await Core1Insight.findOneAndUpdate(
          { _id: insight._id },
          insight,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        successCount++;
      } catch (itemError) {
        console.error(`Error syncing item insight for label ${labels[i]}:`, itemError.message);
        errorCount++;
      }
    }

    console.log(`item insights auto-sync completed: ${successCount} items synced, ${errorCount} errors`);
  } catch (error) {
    console.error('Error in Core1 item insights auto-sync:', error.message);
  }
};

// Function to sync Core1 Insights (Weight Over Time)
const syncCore1WeightInsights = async () => {
  try {
    console.log('Auto-syncing Core1 weight insights...');
    console.log(`Using Core1 endpoint: ${core1}/api/v1/insights/weight-overtime/`);

    const response = await axios.get(
      `${core1}/api/v1/insights/weight-overtime/`,
      {
        headers: {
          Authorization: `Bearer ${core1Token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Log the full response to debug the structure

    const labels = response.data?.labels || [];
    const data = response.data?.data || [];

    if (labels.length === 0 || data.length === 0) {
      console.log('No weight insights to sync.');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < labels.length; i++) {
      try {
        const insight = {
          _id: `weight-${labels[i]}`, // Generate a unique ID based on the label
          type: 'weight',
          data: data[i],
          label: labels[i],
        };

        await Core1Insight.findOneAndUpdate(
          { _id: insight._id },
          insight,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        successCount++;
      } catch (itemError) {
        console.error(`Error syncing weight insight for label ${labels[i]}:`, itemError.message);
        errorCount++;
      }
    }

    console.log(`weight insights auto-sync completed: ${successCount} items synced, ${errorCount} errors`);
  } catch (error) {
    console.error('Error in Core1 weight insights auto-sync:', error.message);
  }
};

const syncLog2Inventory = async () => {
  try {
 

    if (!LOG2_BASE_URL) {
      console.error("Error: EXTERNAL_LOG2 is not defined in the environment variables.");
      return;
    }

    console.log('Auto-syncing inventory data with LOG2 API...');
    console.log(`Using LOG2 endpoint: ${LOG2_BASE_URL}/api/v1/inventory`);

    const response = await axios.get(`${LOG2_BASE_URL}/api/v1/inventory`, {
      headers: {
        Authorization: `Bearer ${process.env.LOG2_API}`,
        'Content-Type': 'application/json',
      },
    });

    const inventoryData = response.data || [];
    const count = Array.isArray(inventoryData) ? inventoryData.length : 0;

    console.log(`Retrieved ${count} inventory records from LOG2`);

    if (count === 0) {
      console.log('No inventory records to sync.');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const item of inventoryData) {
      try {
        await Inventory.findOneAndUpdate(
          { _id: item._id }, // Assuming `_id` is the unique identifier
          item,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        successCount++;
      } catch (itemError) {
        console.error(`Error syncing inventory record with ID ${item._id}:`, itemError.message);
        errorCount++;
      }
    }

    console.log(`inventory data auto-sync completed: ${successCount} items synced, ${errorCount} errors`);
  } catch (error) {
    console.error('Error in LOG2 inventory data auto-sync:', error.message);

    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Unexpected error:', error.message);
    }
  }
};

// Start the scheduler
const startAutoSync = () => {
  // Schedule freight sync
  schedule.scheduleJob(FREIGHT_SYNC_INTERVAL, syncFreightData);
  console.log(`Freight auto-sync scheduled to run with interval: ${FREIGHT_SYNC_INTERVAL}`);

  // Schedule payroll sync
  schedule.scheduleJob(HR3_SYNC_INTERVAL, syncPayrollData);
  console.log(`Payroll auto-sync scheduled to run with interval: ${HR3_SYNC_INTERVAL}`);

  // Schedule leave requests sync
  schedule.scheduleJob(HR3_SYNC_INTERVAL, syncLeaveRequests);
  console.log(`Leave requests auto-sync scheduled to run with interval: ${HR3_SYNC_INTERVAL}`);

  // Schedule job postings sync
  schedule.scheduleJob(HR2_SYNC_INTERVAL, syncJobPostings);
  console.log(`Job postings auto-sync scheduled to run with interval: ${HR2_SYNC_INTERVAL}`);

  // Schedule vehicle data sync
  schedule.scheduleJob(LOG1_SYNC_INTERVAL, syncVehicleData);
  console.log(`Vehicle data auto-sync scheduled to run with interval: ${LOG1_SYNC_INTERVAL}`);

  schedule.scheduleJob(FINANCE_SYNC_INTERVAL, syncMonthlySales);
  console.log(`Monthly sales auto-sync scheduled to run with interval: ${FINANCE_SYNC_INTERVAL}`);

  schedule.scheduleJob(LOG2_SYNC_INTERVAL, syncLog2Inventory);
console.log(`inventory auto-sync scheduled to run with interval: ${LOG2_SYNC_INTERVAL}`);


  schedule.scheduleJob(CORE_SYNC_INTERVAL, syncCore1ShipmentInsights);
  schedule.scheduleJob(CORE_SYNC_INTERVAL, syncCore1CostInsights);
  schedule.scheduleJob(CORE_SYNC_INTERVAL, syncCore1ItemInsights);
  schedule.scheduleJob(CORE_SYNC_INTERVAL, syncCore1WeightInsights);
  // Run all syncs once immediately when the server starts
  syncFreightData();
  syncPayrollData();
  syncLeaveRequests();
  syncJobPostings();
  syncVehicleData();
  syncMonthlySales();
  syncCore1ShipmentInsights();
  syncCore1CostInsights();
  syncCore1ItemInsights();
  syncCore1WeightInsights();
  syncLog2Inventory();
};


export { startAutoSync };