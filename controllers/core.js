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
    
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("❌ API Request Failed:", error?.response?.status, error?.response?.data);
    
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

    return res.status(200).json(getResponse.data);
  } catch (getError) {
    console.error("❌ API Request Failed:", getError?.response?.status, getError?.response?.data);
    
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

    return res.status(200).json(getResponse.data);
  } catch (getError) {
    console.error("❌ API Request Failed:", getError?.response?.status, getError?.response?.data);
    
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

    return res.status(200).json(getResponse.data);
  } catch (getError) {
    console.error("❌ API Request Failed:", getError?.response?.status, getError?.response?.data);
    
    return res.status(getError?.response?.status || 500).json({
      error: getError?.response?.data || "Internal Server Error",
    });
  }
};

