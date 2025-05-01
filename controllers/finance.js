import axios from 'axios';
const EXTERNALFinance = process.env.EXTERNALFinance;






export const   getFinancialAnalytics =  async (req, res) => {
    try {
      const analytics = await FinancialAnalytics.find().sort({ month: -1 });
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  export const getYearlySalesRevenue = async (req, res) => {

    
    try {
      const response = await fetch(`${EXTERNALFinance}/api/salesAndRevenue/yearly-sales-revenue`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return res.json(data);
    } catch (error) {
      console.error('Failed to fetch yearly sales revenue data:', error);
      return res.status(500).json({ error: 'Failed to fetch yearly sales revenue data' });
    }
  };
  export const getMonthly = async(req, res) => {
    try {
      // Check if the external URL is defined
      if (!EXTERNALFinance) {
        console.error('External finance URL is not configured');
        return res.status(503).json({ 
          error: 'External finance system unavailable', 
          status: 'unavailable',
          message: 'The financial reporting system is currently unavailable. Please try again later.'
        });
      }
      
      // Add timeout to detect if the external system is down
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const response = await fetch(`${EXTERNALFinance}/api/salesAndRevenue/monthly-sales-revenue`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if(!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        return res.json(data);
      } catch (error) {
        if (error.name === 'AbortError') {
          console.error('Request to external finance system timed out');
          return res.status(503).json({ 
            error: 'External finance system timeout', 
            status: 'unavailable',
            message: 'The financial reporting system is not responding. Please try again later.'
          });
        }
        throw error; // Re-throw for the outer catch block
      }
    } catch (error) {
      console.error('Failed to fetch monthly sales revenue data:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch monthly sales revenue data',
        status: 'error',
        message: 'Unable to retrieve financial data. Our team has been notified of this issue.'
      });
    }
  }

  export const getAllInvoices = async (req, res) => {
    try {
      console.log("Frontend connected: GET /finance/invoices");
  
      const response = await axios.get(`${EXTERNALFinance}/api/invoice/getAll`)
      const invoices = response.data;
  
      res.status(200).json(invoices);
    } catch (error) {
      console.error("❌ Error fetching invoices from external API:", error.message);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };