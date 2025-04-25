import axios from 'axios'
import Procurement from "../model/procurement.js";

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

const LOG2_BASE_URL = process.env.EXTERNAL_LOG2
const LOG2_API_TOKEN = process.env.LOG2_API

  
// export const log2procurement = async (req, res) => {
//     try {
//         const response = await axios.get(`${LOG2_BASE_URL}/api/v1/procurement`, {
//             headers: {
//                'Authorization': `Bearer ${LOG2_API_TOKEN}`,
//                 'Content-Type': 'application/json',
//             },
//         })
//         return res.status(200).json({
//             success: true,
//             data: response.data
//         })
//     }
//     catch (error) {
//         console.error('Error fetching procurement data:', error)
//         return res.status(500).json({
//             success: false,
//             message: 'Failed to fetch procurement data',
//             error: error.message
//         })
//     }
// }
export const log2procurement = async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        department, 
        startDate, 
        endDate, 
        search 
      } = req.query;
      
      // Build query filters
      const filter = {};
      
      // Add filters if provided
      if (status) filter.status = status;
      if (department) filter.department = department;
      
      // Date range filter
      if (startDate || endDate) {
        filter.procurementDate = {};
        if (startDate) filter.procurementDate.$gte = new Date(startDate);
        if (endDate) filter.procurementDate.$lte = new Date(endDate);
      }
      
      // Text search on title or description
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
  
      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Fetch procurements with pagination
      const procurements = await Procurement.find(filter)
        .sort({ createdAt: -1 }) // Sort by most recent first
        .skip(skip)
        .limit(parseInt(limit));
      
      // Get total count for pagination
      const totalCount = await Procurement.countDocuments(filter);
      
      // Calculate total pages
      const totalPages = Math.ceil(totalCount / parseInt(limit));
      
      return res.status(200).json({
        success: true,
        data: {
          procurements, // This matches what frontend expects now
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: totalCount,
            hasNext: parseInt(page) < totalPages,
            hasPrev: parseInt(page) > 1
          }
        }
      });
      
    } catch (error) {
      console.error("Error fetching procurements:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch procurements",
        error: error.message
      });
    }
  };
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