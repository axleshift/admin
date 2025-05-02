import axios from 'axios'

export const checkAttendanceRecord = async (req, res, next) => {
  try {
    const { id } = req.body;
    
    // Skip check if id is not provided
    if (!id) {
      return next();
    }
    
    // Get current date info for calculating month range
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed (0 = January)
    
    // Create start of month date
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    
    // Create end of month date (start of next month - 1 millisecond)
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
    
    // Format dates for API request
    const startDateStr = startOfMonth.toISOString().split('T')[0];
    const endDateStr = endOfMonth.toISOString().split('T')[0];
    
    // Fetch user's attendance records for the current month
    const attendanceResponse = await axios.get('https://backend-hr1.axleshift.com/api/attendance/all', {
      params: {
        startDate: startDateStr,
        endDate: endDateStr,
        id: id // Using id instead of email for identification
      }
    });
    
    // Extract attendance data
    const attendanceData = attendanceResponse.data;
    
    // If no attendance data found, let the request proceed
    if (!attendanceData || !Array.isArray(attendanceData)) {
      console.log(`No attendance data found for user ID ${id}`);
      return next();
    }
    
    // Count absences in the current month
    const absences = attendanceData.filter(record => 
      record.status === 'Absent'
    );
    
    console.log(`User ID ${id} has ${absences.length} absences this month`);
    
    // If user has 3 or more absences, deny access and instruct to create incident report
    if (absences.length >= 3) {
      return res.status(404).json({
        success: false,
        message: "Access denied. You have exceeded the maximum allowed absences this month. Please make an incident report about your absences and send it to your HR admin."
      });
    }
    
    // If everything is okay, proceed to the next middleware/controller
    next();
    
  } catch (error) {
    console.error('Error checking attendance record:', error);
    
    // Don't block login due to failure in attendance check, but log the error
    // In a production system, you might want to handle this differently
    console.error('Continuing to login process despite attendance check failure');
    next();
  }
};


export const checkIncidentReport = async (req, res, next) => {
  try {
    const { id } = req.body;
    
    // Skip check if id is not provided
    if (!id) {
      return next();
    }
    
    // First, check if the user has excessive absences
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
    
    const startDateStr = startOfMonth.toISOString().split('T')[0];
    const endDateStr = endOfMonth.toISOString().split('T')[0];
    
    // Fetch user's attendance records for the current month
    const attendanceResponse = await axios.get(`${process.env.HR1}/api/attendance/all`, {
      params: {
        startDate: startDateStr,
        endDate: endDateStr,
        id: id
      }
    });
    
    const attendanceData = attendanceResponse.data;
    
    // If no attendance data or fewer than 3 absences, proceed normally
    if (!attendanceData || !Array.isArray(attendanceData)) {
      return next();
    }
    
    // Count absences in the current month
    const absences = attendanceData.filter(record => record.status === 'Absent');
    
    // If user doesn't have excessive absences, proceed normally
    if (absences.length < 3) {
      return next();
    }
    
    console.log(`User ID ${id} has ${absences.length} absences this month. Checking for incident report...`);
    
    // User has excessive absences, check if they've submitted an incident report
    const incidentReportResponse = await axios.get(`${process.env.HR1}/api/incident-report`, {
      params: {
        userId: id,
        type: 'Absence',
        startDate: startDateStr,
        endDate: endDateStr,
        status: 'Submitted'
      }
    });
    
    const incidentReports = incidentReportResponse.data;
    
    // If incident report exists and is in submitted state, allow access
    if (incidentReports && Array.isArray(incidentReports) && incidentReports.length > 0) {
      console.log(`User ID ${id} has submitted an incident report for absences. Access granted.`);
      return next();
    }
    
    // If no incident report found, check if one is in progress (draft state)
    const draftReportResponse = await axios.get(`${process.env.HR1}/api/incident-report`, {
      params: {
        userId: id,
        type: 'Absence',
        startDate: startDateStr,
        endDate: endDateStr,
        status: 'Draft'
      }
    });
    
    const draftReports = draftReportResponse.data;
    
    // If there's a draft report, provide a different message
    if (draftReports && Array.isArray(draftReports) && draftReports.length > 0) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Please complete and submit your incident report about absences to regain access."
      });
    }
    
    // No incident report found at all, deny access
    return res.status(403).json({
      success: false,
      message: "Access denied due to excessive absences. Please create and submit an incident report to regain access."
    });
    
  } catch (error) {
    console.error('Error checking incident report:', error);
    
    // Don't block login due to failure in incident report check, but log the error
    console.error('Continuing to login process despite incident report check failure');
    next();
  }
};