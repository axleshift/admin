import schedule from 'node-schedule';
import axios from 'axios';
import Freight from '../model/core1.js';

const core1 = process.env.EXTERNAL_CORE?.replace(/\/$/, '');
const core1Token = process.env.CORE_API_TOKEN;

// Function to sync data automatically
const syncFreightData = async () => {
  try {
    console.log('Auto-syncing data with External Core API...');
    
    const response = await axios.post(
    [  `${core1}/api/v1/freight/`,
      { page: 1 },
      {
        headers: {
          Authorization: `Bearer ${core1Token}`,
          'Content-Type': 'application/json',
        },
      }]
    );

    const externalData = response.data.data;
    
    if (!Array.isArray(externalData)) {
      console.error('Invalid API response format');
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
    console.error('Error in auto-sync:', error);
  }
};

// Start the scheduler
const startAutoSync = () => {
  // Run every 15 minutes
  schedule.scheduleJob('*/15 * * * *', syncFreightData);
  console.log('Auto-sync scheduled to run every 15 minutes');
  
  // Run once immediately when server starts
  syncFreightData();
};

export { startAutoSync };