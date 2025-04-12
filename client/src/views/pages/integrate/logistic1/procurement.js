import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../utils/axiosInstance';  // Import your Axios instance

const ProcurementPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProcurementData = async () => {
      try {
        const response = await axiosInstance.get('/logistics/procurement');
        setData(response.data.data);
      } catch (error) {
        setError('Error fetching procurement data');
      } finally {
        setLoading(false);
      }
    };

    fetchProcurementData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="procurement-page">
      <h1>Procurement Data</h1>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Procurement Date</th>
            <th>Department</th>
            <th>Status</th>
            <th>Estimated Cost</th>
            <th>Delivery Date</th>
            <th>Products</th>
          </tr>
        </thead>
        <tbody>
          {data.map((procurement) => (
            <tr key={procurement._id}>
              <td>{procurement.title}</td>
              <td>{procurement.description}</td>
              <td>{new Date(procurement.procurementDate).toLocaleDateString()}</td>
              <td>{procurement.department}</td>
              <td>{procurement.status}</td>
              <td>{procurement.estimatedCost}</td>
              <td>{new Date(procurement.deliveryDate).toLocaleDateString()}</td>
              <td>
                <ul>
                  {procurement.products.map((product) => (
                    <li key={product._id}>
                      {product.name} - {product.quantity} {product.unit} (Unit Price: {product.unitPrice})
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProcurementPage;
