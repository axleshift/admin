import schedule from 'node-schedule';
import axios from 'axios';
import Freight from '../model/core1.js';
import Payroll from '../model/Payroll.js';
import notificationUtil from '../UTIL/notificationUtil.js';

// Get environment variables with proper error handling
const EXTERNAL_CORE = process.env.EXTERNAL_CORE?.replace(/\/$/, '') || 'https://backend-core1.axleshift.com';
const CORE_API_TOKEN = process.env.CORE_API_TOKEN || 'core1_4464f45dff3a2310';
const EXTERNAL_HR3 = process.env.EXTERNAL_Hr3?.replace(/\/$/, '') || 'https://hr3.axleshift.com';

// Function to sync data automatically
const syncFreightData = async () => {
  try {
    console.log('Auto-syncing data with External Core API...');
    
    // Changed from GET to POST to match your fetchCore1Data function
    const response = await axios.post(
      `${EXTERNAL_CORE}/api/v1/freight/`,
      { page: 1 }, // Sending page in the body for POST request
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
      await notificationUtil.createSystemNotification(
        "Freight Data Sync Failed",
        `Invalid API response format received from Core API.`
      );
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

    // Create notification for successful sync
    await notificationUtil.createSystemNotification(
      "Freight Data Sync Completed",
      `${successCount} items synced, ${errorCount} errors.`
    );

    console.log(`Auto-sync completed: ${successCount} items synced, ${errorCount} errors`);
  } catch (error) {
    console.error('Error in auto-sync:', error);
    
    // Create notification for failed sync
    await notificationUtil.createSystemNotification(
      "Freight Data Sync Failed",
      `Failed to sync freight data: ${error.message || "Unknown error"}`
    );
  }
};

// Function to sync payroll data automatically
const syncPayrollData = async () => {
  try {
    console.log('Auto-syncing payroll data with HR3 API...');
    
    const response = await fetch(`${EXTERNAL_HR3}/api/payroll`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract payroll entries
    const payrollEntries = data.payrollEntries || [];
    const count = Array.isArray(payrollEntries) ? payrollEntries.length : 0;
    
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
          console.error(`Error syncing payroll item:`, itemError);
          errorCount++;
        }
      }
      
      if (successCount > 0) {
        // Clean up removed entries
        await Payroll.deleteMany({ _id: { $nin: payrollIds } });
      }
    }
    
    console.log(`Payroll auto-sync completed: ${successCount} items synced, ${errorCount} errors`);
    
    // Create notification for successful sync
    await notificationUtil.createNotification({
      title: "Payroll Data Updated",
      message: `Payroll data has been successfully synced from HR3 system.`,
      type: "system",
      metadata: {
        source: "HR3",
        endpoint: "payroll",
        recordsCount: count,
        syncedCount: successCount,
        errorCount: errorCount
      }
    });
    
  } catch (error) {
    console.error('Error in payroll auto-sync:', error);
    
    // Create notification for sync error
    await notificationUtil.createNotification({
      title: "Payroll Data Sync Failed",
      message: `Failed to sync payroll data: ${error.message || "Unknown error"}`,
      type: "system",
      metadata: {
        source: "HR3",
        endpoint: "payroll",
        error: error.message || "Unknown error"
      }
    });
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