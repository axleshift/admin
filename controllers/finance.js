import model from '../model/finance.js';
const { FreightAudit } = model
const { Invoice } = model

const EXTERNALFinance = process.env.EXTERNALFinance;
export const createFreightAudit = async (req, res) => {
    try {
        const newAudit = new FreightAudit(req.body);
        await newAudit.save();
        res.status(201).json(newAudit);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all FreightAudits
export const getAllFreightAudits = async (req, res) => {
  try {
      console.log("Frontend connected: GET /finance/getfreightaudit");

      const audits = await FreightAudit.find(); // Ensure FreightAudit is correctly imported
      console.log("Freight audits fetched:", audits.length, "records found");

      res.status(200).json(audits);
  } catch (error) {
      console.error("Error fetching freight audits:", error.message);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


export const getAllInvoices = async (req, res) => {
  try {
    console.log("Frontend connected: GET /finance/invoices");
    
    const invoices = await Invoice.find();
    res.status(200).json(invoices);

  } catch (error) {
    console.error("❌ Error fetching invoices:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
export const createInvoice = async (req, res) => {
    try {
      const invoice = new Invoice(req.body);
      const savedInvoice = await invoice.save();
      res.status(201).json(savedInvoice);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

export const updateInvoiceStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const updatedInvoice = await Invoice.findByIdAndUpdate(
        id,
        { 
          paymentStatus: req.body.paymentStatus,
          paidDate: req.body.paymentStatus === 'Paid' ? new Date() : null
        },
        { new: true }
      );
      res.json(updatedInvoice);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

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

