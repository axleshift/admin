import Shipping from "../model/Shipping.js";

export const getshipping = async (req, res) => {
    try {
      const { customerId, product } = req.query;
  
      // Find shipping based on customerId and product (you can adapt the query to your needs)
      const shippingData = await Shipping.find({ customerId, product });
  
      if (!shippingData.length) {
        return res.status(404).json({ message: "No shipping data found for the given criteria" });
      }
  
      // Send shipping data
      res.status(200).json(shippingData);
    } catch (error) {
      res.status(500).json({ message: "Error fetching shipping data", error });
    }
  };


  // Controller for creating shipping
  export const createShipping = async (req, res) => {
    try {
        const newShipping = new Shipping(req.body); // Create a new shipping entry
        const savedShipping = await newShipping.save(); // Save to database
        res.status(201).json(savedShipping); // Respond with the created shipping data
    } catch (error) {
        res.status(500).json({ message: "Error creating shipping entry", error });
    }
};