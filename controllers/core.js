import axios from 'axios';
import Freight from '../model/core1.js';

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
    return res.json(response.data);
  } catch (error) {
    console.error('Error fetching freight data:', error);

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
    const postResponse = await axios.post(
      `${core1}/api/v1/insights/shipment-overtime/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${core1Token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json(postResponse.data);
  } catch (postError) {
    
    try {
      const getResponse = await axios.get(
        `${core1}/api/v1/insights/shipment-overtime/`,
        {
          headers: {
            Authorization: `Bearer ${core1Token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return res.status(200).json(getResponse.data);
    } catch (getError) {
      console.error("❌ API Request Failed:", getError?.response?.status, getError?.response?.data);

      return res.status(getError?.response?.status || 500).json({
        error: getError?.response?.data || "Internal Server Error",
      });
    }
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

      return res.status(200).json(getResponse.data);
    } catch (getError) {
      console.error("❌ API Request Failed:", getError?.response?.status, getError?.response?.data);

      return res.status(getError?.response?.status || 500).json({
        error: getError?.response?.data || "Internal Server Error",
      });
    }
  }

export const fetchcore1insightitem = async (req, res) => {

    try {
      const getResponse = await axios.get(
        `${core1}api/v1/insights/item-overtime/`,
        {
          headers: {
            Authorization: `Bearer ${core1Token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return res.status(200).json(getResponse.data);
    } catch (getError) {
      console.error("❌ API Request Failed:", getError?.response?.status, getError?.response?.data);

      return res.status(getError?.response?.status || 500).json({
        error: getError?.response?.data || "Internal Server Error",
      });
    }
  }
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

      return res.status(200).json(getResponse.data);
    } catch (getError) {
      console.error("❌ API Request Failed:", getError?.response?.status, getError?.response?.data);

      return res.status(getError?.response?.status || 500).json({
        error: getError?.response?.data || "Internal Server Error",
      });
    }
  }


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