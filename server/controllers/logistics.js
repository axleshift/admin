import axios from 'axios'

// Directly use the hardcoded values instead of environment variables
const LOG1_API = process.env.EXTERNAL_LOG1
const LOG1_APIKEY = process.env.LOG1_API_KEY



export const log1vehicle = async (req, res) => {
    try {
        const response = await axios.get(`${LOG1_API}/api/v1/vehicle/all`, {
            headers: {
                'x-api-key': LOG1_APIKEY,  // Changed to use proper header format
                'Content-Type': 'application/json',
            },
        })
        return res.status(200).json({
            success: true,
            data: response.data
        })
    }
    catch (error) {
        console.error('Error fetching vehicle data:', error)
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch vehicle data',
            error: error.message
        })
    }
}

//log2

const LOG2_BASE_URL = "https://backend-log2.axleshift.com";
const LOG2_API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2Y2NzE4MzI1ZWVkOGY5YmU2ODliZjEiLCJyb2xlIjoic3VwZXIgYWRtaW4iLCJlbWFpbCI6ImxvZ2l0ZWNodzJAZ21haWwuY29tIiwiaWF0IjoxNzQ0NDI5OTc4LCJleHAiOjE3NDQ0MzM1Nzh9.1TYS6gq8uDYPkYCcabiIJAlpaKwa2s3HnBKj2WiJ3jo';


  
export const log2procurement = async (req, res) => {
    try {
        const response = await axios.get(`${LOG2_BASE_URL}/api/v1/procurement`, {
            headers: {
               'Authorization': `Bearer ${LOG2_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
        })
        return res.status(200).json({
            success: true,
            data: response.data
        })
    }
    catch (error) {
        console.error('Error fetching procurement data:', error)
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch procurement data',
            error: error.message
        })
    }
}
export const log2inventory = async (req, res) => {
  try {
      const response = await axios.get(`${LOG2_BASE_URL}/api/v1/inventory`);
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(error.response?.status || 500).json({
      message: 'Error fetching inventory data',
      error: error.message
    });
  }
}