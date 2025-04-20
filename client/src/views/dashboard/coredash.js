import React, { useState, useEffect } from 'react';
import StatBox from '../pages/scene/statbox';
import CustomHeader from '../../components/header/customhead';
import { CContainer, CRow, CCol } from '@coreui/react';
import FreightTable from '../pages/integrate/core/shipment';
import axiosInstance from '../../utils/axiosInstance';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShippingFast, 
  faMoneyBillWave,
  faBoxOpen,
  faChartLine,
  faBoxes
} from '@fortawesome/free-solid-svg-icons';

const CoreDash = () => {
  const [shipmentData, setShipmentData] = useState([]);
  const [costData, setCostData] = useState(null);
  const [weightData, setWeightData] = useState(null);
  const [itemData, setItemData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Retrieve user information from localStorage
  const userName = localStorage.getItem('name');
  const userRole = localStorage.getItem('role');
  const userDepartment = localStorage.getItem('department');

  // Auto-detect and format currency function
  const autoDetectAndFormatCurrency = (amount) => {
    if (amount === undefined || amount === null) return 'N/A';
    
    // Convert to string if it's a number
    const amountStr = typeof amount === 'number' ? amount.toString() : amount;
    
    // Remove whitespace and common separators to help with detection
    const sanitized = amountStr.replace(/[\s,]/g, '');
    
    // Currency symbol detection patterns
    const currencyPatterns = {
      '$': 'USD',
      '₱': 'PHP',
      '€': 'EUR',
      '£': 'GBP',
      '¥': 'JPY',
      '₩': 'KRW',
      '₹': 'INR',
      'R$': 'BRL',
      'A$': 'AUD',
      'C$': 'CAD',
      '฿': 'THB',
      '₽': 'RUB',
      'kr': 'SEK', // Used for multiple Nordic currencies
      'CHF': 'CHF',
      'zł': 'PLN'
    };
    
    // Check for currency codes at start or end
    const currencyCodes = ['USD', 'PHP', 'EUR', 'GBP', 'JPY', 'KRW', 'INR', 'BRL', 'AUD', 'CAD', 'THB', 'RUB', 'SEK', 'CHF', 'PLN'];
    let detectedCurrency = 'USD'; // Default currency
    
    // First, check for symbols
    for (const [symbol, currency] of Object.entries(currencyPatterns)) {
      if (sanitized.includes(symbol)) {
        detectedCurrency = currency;
        break;
      }
    }
    
    // Then check for currency codes
    for (const code of currencyCodes) {
      if (sanitized.includes(code)) {
        detectedCurrency = code;
        break;
      }
    }
    
    // Extract the numeric value
    let numericValue = sanitized.replace(/[^\d.-]/g, '');
    
    // Parse to float
    const value = parseFloat(numericValue);
    
    // If we couldn't parse a valid number, return the original input
    if (isNaN(value)) return amount;
    
    // Format with the detected currency
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: detectedCurrency
    }).format(value);
  };

  useEffect(() => {
    const fetchFreightData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/core/fetch-core');
        const fetchedData = response.data?.data || [];
        setShipmentData(fetchedData);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch shipment data');
        setLoading(false);
      }
    };
    
    const fetchCostData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/core/insight/cost');
        // Store the complete response data
        setCostData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch insight Cost Data');
        setLoading(false);
      }
    };
    
    const fetchWeightData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/core/insight/weight');
        setWeightData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch insight Weight Data');
        setLoading(false);
      }
    };
    
    const fetchItemData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/core/insight/item?timeframe=6months');
        setItemData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch insight Item Data');
        setLoading(false);
      }
    };
    
    fetchWeightData();
    fetchCostData();
    fetchFreightData();
    fetchItemData(); // Added fetch for item data
  }, []);

  // Calculate statistics
  const totalShipments = shipmentData.length;
  const totalWeight = shipmentData.reduce((sum, shipment) => sum + (parseFloat(shipment.total_weight) || 0), 0);
  const totalItems = shipmentData.reduce((sum, shipment) => sum + (parseInt(shipment.number_of_items) || 0), 0);
  
  // Calculate total insight cost - using the same calculation logic as in InsightCost component
  let totalInsightCost = 0;
  if (costData) {
    // Parse the data if it's a string
    const parsedData = typeof costData === 'string' ? JSON.parse(costData) : costData;
    
    // Check if data array exists and sum values
    if (parsedData && parsedData.data && Array.isArray(parsedData.data)) {
      totalInsightCost = parsedData.data.reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
    }
  }

  // Calculate total insight weight - using similar logic to InsightWeight component
  let totalInsightWeight = 0;
  if (weightData) {
    // Parse the data if it's a string
    const parsedData = typeof weightData === 'string' ? JSON.parse(weightData) : weightData;
    
    // Handle different data structures based on the InsightWeight component
    if (parsedData && parsedData.data && Array.isArray(parsedData.data)) {
      // Direct data array - sum all values
      totalInsightWeight = parsedData.data.reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
    } else if (parsedData && Array.isArray(parsedData)) {
      // Array of objects with weight property
      totalInsightWeight = parsedData.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);
    } else if (parsedData && parsedData.weights && Array.isArray(parsedData.weights)) {
      // Object with weights array
      totalInsightWeight = parsedData.weights.reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
    } else if (parsedData && parsedData.data && parsedData.data.weights && Array.isArray(parsedData.data.weights)) {
      // Nested data structure
      totalInsightWeight = parsedData.data.weights.reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
    }
  }

  // Calculate total insight items - using similar logic from InsightItem component
  let totalInsightItems = 0;
  if (itemData) {
    // Parse the data if it's a string
    const parsedData = typeof itemData === 'string' ? JSON.parse(itemData) : itemData;
    
    // Handle different data structures based on the InsightItem component
    if (parsedData && parsedData.data && Array.isArray(parsedData.data)) {
      // Direct data array - sum all values
      totalInsightItems = parsedData.data.reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
    } else if (parsedData && Array.isArray(parsedData)) {
      // Array of objects with count property
      totalInsightItems = parsedData.reduce((sum, item) => sum + (parseFloat(item.count || 0)), 0);
    } else if (parsedData && parsedData.items && Array.isArray(parsedData.items)) {
      // Object with items array
      totalInsightItems = parsedData.items.reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
    }
  }

  return (
    <>
      <CustomHeader title="Core Dashboard" />
      <CContainer fluid>
        <CRow className="mb-4">
          <CCol sm={6} lg={3}>
            <StatBox 
              title="Total Shipments"
              value={totalShipments}
              icon={<FontAwesomeIcon icon={faShippingFast} />}
              color="primary"
              loading={loading}
              description="Total shipments tracked" // Added required description prop
            />
          </CCol>
          <CCol sm={6} lg={3}>
            <StatBox 
              title="Insight Cost"
              value={autoDetectAndFormatCurrency(totalInsightCost)}
              icon={<FontAwesomeIcon icon={faChartLine} />}
              color="success"
              loading={loading}
              description="Cost insights for period" // Added required description prop
            />
          </CCol>
          <CCol sm={6} lg={3}>
            <StatBox 
              title="Insight Weight"
              value={`${totalInsightWeight.toFixed(2)} kg`}
              icon={<FontAwesomeIcon icon={faBoxOpen} />}
              color="info"
              loading={loading}
              description="Total weight tracked" // Added required description prop
            />
          </CCol>
          <CCol sm={6} lg={3}>
            <StatBox 
              title="Insight Items"
              value={totalInsightItems.toFixed(0)}
              icon={<FontAwesomeIcon icon={faBoxes} />}
              color="warning"
              loading={loading}
              description="Total items shipped" // Added required description prop
            />
          </CCol>
        </CRow>
        
        <CRow className="mb-4">
          <CCol lg={8}>
            <FreightTable />
          </CCol>
          <CCol lg={4}>
          </CCol>
        </CRow>
      </CContainer>
    </>
  );
};

export default CoreDash;