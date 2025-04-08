import schedule from 'node-schedule';
import axios from 'axios';
import Freight from '../model/core1.js';
import Payroll from '../model/Payroll.js';

// Get environment variables with proper error handling - standardized to uppercase
const EXTERNAL_CORE = process.env.EXTERNAL_CORE?.replace(/\/$/, '') || 'https://backend-core1.axleshift.com';
const CORE_API_TOKEN = process.env.CORE_API_TOKEN || 'core1_4464f45dff3a2310';
// Standardized to uppercase for consistency
const EXTERNAL_HR3 = process.env.EXTERNAL_HR3?.replace(/\/$/, '') || process.env.EXTERNAL_Hr3?.replace(/\/$/, '') || 'https://hr3.axleshift.com';

// Function to sync data automatically
const syncFreightData = async () => {
  try {
    console.log('Auto-syncing data with External Core API...');
    
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

    // Make sure we're accessing the data correctly based on response structure
    const externalData = response.data.results || response.data.data || [];
    
    if (!Array.isArray(externalData)) {
      console.error('Invalid API response format', response.data);
      return;
    }

    const externalIds = externalData.map(item => item._id);
    let successCount = 0;
    let errorCount = 0;

    for (const item of externalData) {
      try {
        // Handle null tracking numbers
        if (item.tracking_number === null) {
          item.tracking_number = `GENERATED-${item._id}-${Date.now()}`;
        }
        
        await Freight.findOneAndUpdate(
          { _id: item._id },
          item,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        successCount++;
      } catch (itemError) {
        console.error(`Error syncing item ${item._id}:`, itemError);
        errorCount++;
      }
    }

    if (successCount > 0) {
      await Freight.deleteMany({ _id: { $nin: externalIds } });
    }

    console.log(`Auto-sync completed: ${successCount} items synced, ${errorCount} errors`);
  } catch (error) {
    console.error('Error in auto-sync:', error.message, error.stack);
  }
};

// Function to sync payroll data automatically - changed to use axios for consistency
const syncPayrollData = async () => {
  try {
    console.log('Auto-syncing payroll data with HR3 API...');
    console.log(`Using HR3 endpoint: ${EXTERNAL_HR3}/api/payroll`);
    
    // Changed from fetch to axios for consistency and better compatibility
    const response = await axios.get(`${EXTERNAL_HR3}/api/payroll`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Extract data from axios response
    const data = response.data;
    
    // Extract payroll entries
    const payrollEntries = data.payrollEntries || [];
    const count = Array.isArray(payrollEntries) ? payrollEntries.length : 0;
    
    console.log(`Retrieved ${count} payroll entries from HR3`);
    
    // Save to database - ensure Payroll model is imported
    let successCount = 0;
    let errorCount = 0;
    
    if (count > 0) {
      // First, get all IDs for cleanup later
      const payrollIds = payrollEntries.map(item => item.id || item._id);
      
      for (const item of payrollEntries) {
        try {
          // Make sure Payroll model is properly imported at the top of file
          await Payroll.findOneAndUpdate(
            { _id: item.id || item._id }, // Handle different ID field names
            item,
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
          successCount++;
        } catch (itemError) {
          console.error(`Error syncing payroll item:`, itemError.message);
          errorCount++;
        }
      }
      
      if (successCount > 0) {
        // Clean up removed entries
        await Payroll.deleteMany({ _id: { $nin: payrollIds } });
      }
    }
    
    console.log(`Payroll auto-sync completed: ${successCount} items synced, ${errorCount} errors`);
  } catch (error) {
    console.error('Error in payroll auto-sync:', error.message);
    // More detailed error logging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    }
  }
};

// Start the scheduler
const startAutoSync = () => {
  // Run every 15 minutes
  schedule.scheduleJob('*/15 * * * *', syncFreightData);
  console.log('Auto-sync scheduled to run every 15 minutes');

  schedule.scheduleJob('0 * * * *', syncPayrollData);
  console.log('Payroll auto-sync scheduled to run every hour');
  
  // Run once immediately when server starts
  syncFreightData();
  syncPayrollData();
};

export { startAutoSync };