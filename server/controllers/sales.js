import Shipping from "../model/Shipping.js";

// Fetch shipping data based on customerId and product
export const getShipping = async (req, res) => {
  try {
    const { customerId, product } = req.query;

    const shippingData = await Shipping.find({ customerId, product });

    if (!shippingData.length) {
      return res.status(404).json({ message: "No shipping data found for the given criteria" });
    }

    res.status(200).json(shippingData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching shipping data", error });
  }
};

// Controller for creating shipping
export const createShipping = async (req, res) => {
  try {
    const newShipping = new Shipping(req.body);
    const savedShipping = await newShipping.save();
    res.status(201).json(savedShipping);
  } catch (error) {
    res.status(500).json({ message: "Error creating shipping entry", error });
  }
};

// Controller for updating shipping
export const updateShipping = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedShipping = await Shipping.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedShipping) {
      return res.status(404).json({ message: 'Shipping record not found' });
    }
    res.status(200).json(updatedShipping);
  } catch (error) {
    res.status(500).json({ message: 'Error updating shipping record', error });
  }
};
