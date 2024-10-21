import Logistics from "../model/logix.js";

// Get all logistics data
export const getLogistics = async (req, res) => {
    try {
        const logistics = await Logistics.find();
        res.status(200).json(logistics);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// Get specific logistics by ID
export const getLogisticsById = async (req, res) => {
    const { id } = req.params;
    try {
        const logistics = await Logistics.findById(id);
        if (!logistics) {
            return res.status(404).json({ message: "Logistics not found" });
        }
        res.status(200).json(logistics);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// Get logistics by tracking number
export const getLogisticsByTrackingNum = async (req, res) => {
    const { trackingNum } = req.body; // Expecting trackingNum from the body
    try {
        const logistics = await Logistics.findOne({ trackingNum });
        if (!logistics) {
            return res.status(404).json({ message: "Logistics not found" });
        }
        res.status(200).json(logistics);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// Delete logistics by ID
export const deleteLogistics = async (req, res) => {
    const { id } = req.params;

    try {
        await Logistics.findByIdAndRemove(id);
        res.status(200).json({ message: "Logistics deleted successfully" });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const updateLogistics = async (req, res) => {
    const { id } = req.params;
    const { currentLocation } = req.body;
  
    try {
      const updatedLogistics = await Logistics.findByIdAndUpdate(
        id,
        { currentLocation },
        { new: true }
      );
  
      if (!updatedLogistics) {
        return res.status(404).json({ message: "Logistics not found" });
      }
  
      res.status(200).json(updatedLogistics);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.message });
    }
  };