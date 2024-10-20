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
