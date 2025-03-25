import Shipment from './../model/core.js';
import {fetchFreightData} from '../services/webhookServiceCore.js';
export const ship = async (req, res) => {
  try {
    const shipments = await Shipment.find();
    res.json(shipments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const shipId = async (req, res) => {
  try {
    const shipment = await Shipment.findById({ shipmentId: req.params.id });
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    res.json(shipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const syncFreightData = async(req,res)=>{
  try {
    const freights = await fetchFreightData();
    res.status(200).json({
        message: 'Freight data synced successfully',
        count: freights.length
    });
} catch (error) {
    res.status(500).json({
        message: 'Failed to sync freight data',
        error: error.message
    });
}

}