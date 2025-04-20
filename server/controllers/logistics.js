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