import React, { useState } from 'react';
import { useCreateShippingMutation } from './../../../state/api'; // Adjust import based on your API setup

const landCargoOptions = [
  { id: 1, name: 'Dry Van', volume: 4000, image: '/img/dryvan.jpeg' },
  { id: 2, name: 'Box Truck', volume: 6000, image: '/img/box truck.png' },
  { id: 3, name: 'Flatbed Truck', volume: 4800, image: '/img/flatbed.jpeg' },

];

const LandCargo = () => {
  const [customerName, setCustomerName] = useState('');
  const [orderVolume, setOrderVolume] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [status, setStatus] = useState('pending');
  const [selectedLandCargo, setSelectedLandCargo] = useState(landCargoOptions[0]); // Default selection

  const [createShipping, { isLoading, error }] = useCreateShippingMutation();

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

    const weightClass = getWeightClass(Number(orderVolume));
    try {
      await createShipping({ customerName, orderVolume, orderDate, weightClass, status });
      alert("Shipping details submitted successfully!");
      setCustomerName('');
      setOrderVolume('');
      setOrderDate('');
      setStatus('pending');
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
          value={selectedLandCargo.id}
          onChange={(e) => {
            const cargo = landCargoOptions.find(c => c.id === Number(e.target.value));
            setSelectedLandCargo(cargo);
            setOrderVolume(cargo.volume); // Auto-set volume based on selected land cargo
          }}
        >
          {landCargoOptions.map(cargo => (
            <option key={cargo.id} value={cargo.id}>{cargo.name}</option>
          ))}
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
        <div>
          <img src={selectedLandCargo.image} alt={selectedLandCargo.name} style={{ width: '100px' }} />
          <p>{`${selectedLandCargo.name} can carry up to ${selectedLandCargo.volume} kg.`}</p>
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Submit Shipping Details"}
        </button>
      </form>
      {error && <p>Error submitting shipping details: {error.message}</p>}
      {orderVolume && <p>Weight Class: {getWeightClass(Number(orderVolume))}</p>}
    </div>
  );
};

export default LandCargo;
