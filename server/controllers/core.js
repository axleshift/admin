import axios from 'axios';
import Freight from '../model/core1.js';
import notificationUtil from "../UTIL/notificationUtil.js";

const core1 = process.env.EXTERNAL_CORE?.replace(/\/$/, '');
const core1Token = process.env.CORE_API_TOKEN;


//core1



export const fetchCore1Data = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const response = await axios.post(
      `${core1}/api/v1/freight/`,
      { page },
      {
        headers: {
          Authorization: `Bearer ${core1Token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    // Create notification for new freight data
    if (response.data && response.data.results && response.data.results.length > 0) {
      await notificationUtil.createSystemNotification(
        "New Freight Data Available",
        `${response.data.results.length} freight records have been fetched from Core1.`
      );
    }
    
    return res.json(response.data);
  } catch (error) {
    console.error('Error fetching freight data:', error);

    // Create notification for failed fetch
    await notificationUtil.createNotification({
      title: "Freight Data Fetch Failed",
      message: `Failed to fetch freight data: ${error.message || "Unknown error"}`,
      type: "error"
    });

    if (error.response) {
      return res.status(error.response.status).json({
        error: 'Failed to fetch data',
        details: error.response.data,
      });
    } else if (error.request) {
      return res.status(500).json({ error: 'No response from API' });
    } else {
      return res.status(500).json({ error: error.message });
    }
  }
};

export const fetchcore1insightshipment = async (req, res) => {
  try {
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
    
    // Create notification for new shipment insight data
    if (response.data) {
      await notificationUtil.createNotification({
        title: "Shipment Insights Updated",
        message: "New shipment overtime insights data has been fetched from Core1.",
        type: "info"
      });
    }
    
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("❌ API Request Failed:", error?.response?.status, error?.response?.data);
    
    // Create notification for failed fetch
    await notificationUtil.createNotification({
      title: "Shipment Insights Fetch Failed",
      message: `Failed to fetch shipment insights: ${error.message || "Unknown error"}`,
      type: "error"
    });
    
    return res.status(error?.response?.status || 500).json({
      error: error?.response?.data || "Internal Server Error",
    });
  }
};

export const fetchcore1insightcost = async (req, res) => {
  try {
    const getResponse = await axios.get(
      `${core1}/api/v1/insights/cost-overtime/`,
      {
        headers: {
          Authorization: `Bearer ${core1Token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Create notification for new cost insight data
    if (getResponse.data) {
      await notificationUtil.createNotification({
        title: "Cost Insights Updated",
        message: "New cost overtime insights data has been fetched from Core1.",
        type: "info"
      });
    }

    return res.status(200).json(getResponse.data);
  } catch (getError) {
    console.error("❌ API Request Failed:", getError?.response?.status, getError?.response?.data);
    
    // Create notification for failed fetch
    await notificationUtil.createNotification({
      title: "Cost Insights Fetch Failed",
      message: `Failed to fetch cost insights: ${getError.message || "Unknown error"}`,
      type: "error"
    });

    return res.status(getError?.response?.status || 500).json({
      error: getError?.response?.data || "Internal Server Error",
    });
  }
};

export const fetchcore1insightitem = async (req, res) => {
  try {
    const getResponse = await axios.get(
      `${core1}/api/v1/insights/items-overtime/`,
      {
        headers: {
          Authorization: `Bearer ${core1Token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Create notification for new item insight data
    if (getResponse.data) {
      await notificationUtil.createNotification({
        title: "Item Insights Updated",
        message: "New items overtime insights data has been fetched from Core1.",
        type: "info"
      });
    }

    return res.status(200).json(getResponse.data);
  } catch (getError) {
    console.error("❌ API Request Failed:", getError?.response?.status, getError?.response?.data);
    
    // Create notification for failed fetch
    await notificationUtil.createNotification({
      title: "Item Insights Fetch Failed",
      message: `Failed to fetch item insights: ${getError.message || "Unknown error"}`,
      type: "error"
    });

    return res.status(getError?.response?.status || 500).json({
      error: getError?.response?.data || "Internal Server Error",
    });
  }
};

export const fetchcore1insightweight = async (req, res) => {
  try {
    const getResponse = await axios.get(
      `${core1}/api/v1/insights/weight-overtime/`,
      {
        headers: {
          Authorization: `Bearer ${core1Token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Create notification for new weight insight data
    if (getResponse.data) {
      await notificationUtil.createNotification({
        title: "Weight Insights Updated",
        message: "New weight overtime insights data has been fetched from Core1.",
        type: "info"
      });
    }

    return res.status(200).json(getResponse.data);
  } catch (getError) {
    console.error("❌ API Request Failed:", getError?.response?.status, getError?.response?.data);
    
    // Create notification for failed fetch
    await notificationUtil.createNotification({
      title: "Weight Insights Fetch Failed",
      message: `Failed to fetch weight insights: ${getError.message || "Unknown error"}`,
      type: "error"
    });

    return res.status(getError?.response?.status || 500).json({
      error: getError?.response?.data || "Internal Server Error",
    });
  }
};


export const syncCore1Data = async (req, res) => {
  try {
    console.log('Syncing data with External Core API...');

    const page = req.query.page || 1;

    // Fetch data from external API
    const response = await axios.post(
      `${core1}/api/v1/freight/`,
      { page },
      {
        headers: {
          Authorization: `Bearer ${core1Token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const externalData = response.data.data;

    if (!Array.isArray(externalData)) {
      return res.status(400).json({ error: 'Invalid API response format: Expected an array under "data"' });
    }

    const externalIds = externalData.map(item => item._id);
    let successCount = 0;
    let errorCount = 0;

    // Process each item individually to handle errors better
    for (const item of externalData) {
      try {
        // Generate a unique tracking number if null
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

    // Only delete items that were successfully synced
    if (successCount > 0) {
      await Freight.deleteMany({ _id: { $nin: externalIds } });
    }

    console.log('Sync completed successfully.');
    res.json({ 
      message: 'Sync completed', 
      syncedCount: successCount,
      errorCount: errorCount
    });

  } catch (error) {
    console.error('Error syncing freight data:', error);

    if (error.response) {
      return res.status(error.response.status).json({
        error: 'Failed to sync data',
        details: error.response.data,
      });
    } else if (error.request) {
      return res.status(500).json({ error: 'No response from API' });
    } else {
      return res.status(500).json({ error: error.message });
    }
  }
};