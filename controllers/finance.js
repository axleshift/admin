import model from '../model/finance.js';
const { FreightAudit } = model
const { Invoice } = model
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