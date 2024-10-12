import Shipping from "../model/Shipping.js";

// Controller for fetching shipping data
export const getshipping = async (req, res) => {
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

// Controller for creating new shipping
export const createShipping = async (req, res) => {
  try {
    const newShipping = new Shipping(req.body);
    const savedShipping = await newShipping.save();
    res.status(201).json(savedShipping);
  } catch (error) {
    res.status(500).json({ message: "Error creating shipping entry", error });
  }
};

// Controller for updating shipping (PATCH)
export const updateShipping = async (req, res) => {
  try {
    const { id } = req.params;  // Get ID from URL params
    const updatedShipping = await Shipping.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedShipping) {
      return res.status(404).json({ message: "Shipping entry not found" });
    }

    res.status(200).json(updatedShipping);
  } catch (error) {
    res.status(500).json({ message: "Error updating shipping entry", error });
  }
};
