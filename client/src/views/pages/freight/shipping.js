import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useCreateShippingMutation } from './../../../state/api'; // Adjust import based on your API setup

const Shipping = () => {
  const [customerName, setCustomerName] = useState('');
  const [orderVolume, setOrderVolume] = useState('');
  const [shippingType, setShippingType] = useState('sea'); // Default shipping type
  const [orderDate, setOrderDate] = useState('');
  const [weightClass, setWeightClass] = useState(''); // State for weight class
  const [status, setStatus] = useState('pending'); // Default status

  // Assuming you have a mutation defined for creating shipping
  const [createShipping, { isLoading, error }] = useCreateShippingMutation();

  // Function to determine weight class based on order volume
  const getWeightClass = (volume) => {
    if (volume <= 5) return 'Class 50 (0 - 5 kg)';
    if (volume <= 10) return 'Class 55 (6 - 10 kg)';
    if (volume <= 15) return 'Class 60 (11 - 15 kg)';
    if (volume <= 20) return 'Class 65 (16 - 20 kg)';
    if (volume <= 30) return 'Class 70 (21 - 30 kg)';
    if (volume <= 50) return 'Class 77.5 (31 - 50 kg)';
    if (volume <= 70) return 'Class 85 (51 - 70 kg)';
    if (volume <= 100) return 'Class 100 (71 - 100 kg)';
    if (volume <= 125) return 'Class 110 (101 - 125 kg)';
    return 'Class 125 (125 kg and above)';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerName || !orderVolume || !orderDate) {
      alert("Please fill in all fields.");
      return;
    }

    const weightClass = getWeightClass(Number(orderVolume)); // Calculate weight class based on volume

    try {
      await createShipping({ customerName, orderVolume, shippingType, orderDate, weightClass, status });
      alert("Shipping details submitted successfully!");
      // Optionally, reset the form
      setCustomerName('');
      setOrderVolume('');
      setOrderDate('');
      setWeightClass(''); // Reset weight class
      setStatus('pending'); // Reset status
    } catch (error) {
      console.error("Failed to submit shipping details:", error);
      alert("An error occurred while submitting shipping details.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Order Volume (kg)"
          value={orderVolume}
          onChange={(e) => setOrderVolume(e.target.value)}
          required
        />
        <select
          value={shippingType}
          onChange={(e) => setShippingType(e.target.value)}
        >
          <option value="sea">Sea</option>
          <option value="land">Land</option>
          <option value="air">Air</option>
        </select>
        <input
          type="date"
          value={orderDate}
          onChange={(e) => setOrderDate(e.target.value)}
          required
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="in transit">In Transit</option>
          <option value="processing">Processing</option>
          <option value="cancelled">Cancelled</option>
          <option value="failed">Failed</option>
        </select>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Submit Shipping Details"}
        </button>
      </form>

      {error && <p>Error submitting shipping details: {error.message}</p>}
      {weightClass && <p>Weight Class: {weightClass}</p>} {/* Display weight class */}
    </div>
  );
};

export default Shipping;
