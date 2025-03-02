import { SecurityIncident } from '../model/securityIncident.js';

export const getSecurityIncidents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Build filter query
    const filterQuery = {};
    
    // Apply standard filters
    if (req.query.username) filterQuery.username = new RegExp(req.query.username, 'i');
    if (req.query.type) filterQuery.type = new RegExp(req.query.type, 'i');
    if (req.query.severity) filterQuery.severity = req.query.severity;
    if (req.query.status) filterQuery.status = req.query.status;
    if (req.query.ipAddress) filterQuery.ipAddress = new RegExp(req.query.ipAddress, 'i');
    
    // Date range filtering
    if (req.query.startDate || req.query.endDate) {
      filterQuery.timestamp = {};
      if (req.query.startDate) filterQuery.timestamp.$gte = new Date(req.query.startDate);
      if (req.query.endDate) {
        // Set the end date to the end of the day
        const endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999);
        filterQuery.timestamp.$lte = endDate;
      }
    }

    // Execute queries in parallel
    const [incidents, total] = await Promise.all([
      SecurityIncident.find(filterQuery)
        .sort({ timestamp: -1, severity: -1 }) // Sort by time and severity
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean() for better performance
      SecurityIncident.countDocuments(filterQuery)
    ]);

    res.status(200).json({
      incidents,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching security incidents:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};