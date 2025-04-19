import React, { useState, useEffect } from "react";
import PropTypes from "prop-types"; // Import PropTypes
import { 
  CCard, 
  CCardHeader, 
  CCardBody, 
  CNav, 
  CNavItem, 
  CNavLink, 
  CRow, 
  CCol,
  CToaster,
  CToast,
  CToastHeader,
  CToastBody
} from "@coreui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBox, 
  faDollarSign, 
  faWeight, 
  faBoxes, 
  faChartLine,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import InsightShipment from "./core analysys overtime/insightShipment";
import InsightCost from "./core analysys overtime/insightCost";
import InsightItem from "./core analysys overtime/insightItem";
import InsightWeight from "./core analysys overtime/insightWeight";
import logActivity from "../../../../utils/activityLogger";

// Create a toast container component that sits outside the main component
const ToastContainer = ({ toast, toastMessage, setToast }) => {
  return (
    <div style={{ 
      position: 'fixed', 
      top: '20px', 
      right: '20px', 
      zIndex: 1050,
      minWidth: '250px'
    }}>
      <CToast
        visible={toast > 0}
        onClose={() => setToast(0)}
        autohide={true}
        delay={3000}
        key={toast}
        className="border-left-success"
      >
        <CToastHeader closeButton>
          <FontAwesomeIcon icon={faCheckCircle} className="me-2 text-success" />
          <strong className="me-auto">Success</strong>
        </CToastHeader>
        <CToastBody>{toastMessage}</CToastBody>
      </CToast>
    </div>
  );
};

// Add PropTypes validation for ToastContainer
ToastContainer.propTypes = {
  toast: PropTypes.number.isRequired,
  toastMessage: PropTypes.string.isRequired,
  setToast: PropTypes.func.isRequired
};

const CombinedInsights = () => {
  // State to track which insight is currently active
  const [activeInsight, setActiveInsight] = useState("shipment");
  
  // Toast notification states
  const [toast, setToast] = useState(0);
  const [toastMessage, setToastMessage] = useState("");
  const [dataFetched, setDataFetched] = useState(false);

  // Get user information from localStorage
  const userRole = localStorage.getItem('role');
  const userDepartment = localStorage.getItem('department');
  const userName = localStorage.getItem('name');
  const userId = localStorage.getItem('userId');

  // Button configuration data
  const insightButtons = [
    { id: "shipment", label: "Shipment", icon: faBox, color: "success" },
    { id: "cost", label: "Cost", icon: faDollarSign, color: "primary" },
    { id: "weight", label: "Weight", icon: faWeight, color: "warning" },
    { id: "item", label: "Item", icon: faBoxes, color: "purple" }
  ];

  // Log page visit when component mounts and show toast when data is fetched
  useEffect(() => {
    if (userId && userName && userRole && userDepartment) {
      logActivity({
        name: userName,
        role: userRole,
        department: userDepartment,
        route: '/insights',
        action: 'Page Visit',
        description: 'User visited the analytics dashboard'
      }).catch(console.warn);
      
      // Simulate data fetching with a short timeout
      setTimeout(() => {
        setDataFetched(true);
        showToast(`${activeInsight.charAt(0).toUpperCase() + activeInsight.slice(1)} data has been successfully fetched`);
      }, 1000);
    }
  }, [userId, userName, userRole, userDepartment, activeInsight]);

  // Function to display toast notification
  const showToast = (message) => {
    setToastMessage(message);
    setToast(prev => prev + 1);
  };

  // Handle tab change, log activity, and show data fetching toast
  const handleInsightChange = (insightId) => {
    setActiveInsight(insightId);
    setDataFetched(false);
    
    // Log the tab change activity
    if (userId && userName && userRole && userDepartment) {
      logActivity({
        name: userName,
        role: userRole,
        department: userDepartment,
        route: '/insights',
        action: 'Tab Change',
        description: `User viewed ${insightId} analytics`
      }).catch(console.warn);
    }
    
    // Simulate data fetching with a short timeout when changing tabs
    setTimeout(() => {
      setDataFetched(true);
      showToast(`${insightId.charAt(0).toUpperCase() + insightId.slice(1)} data has been successfully fetched`);
    }, 800);
  };

  // Render the active insight component
  const renderActiveInsight = () => {
    switch (activeInsight) {
      case "shipment": return <InsightShipment />;
      case "cost":     return <InsightCost />;
      case "weight":   return <InsightWeight />;
      case "item":     return <InsightItem />;
      default:         return <InsightShipment />;
    }
  };

  return (
    <>
      {/* Toast container is positioned outside the main component */}
      <ToastContainer 
        toast={toast} 
        toastMessage={toastMessage} 
        setToast={setToast} 
      />

      <CCard className="mb-4">
        <CCardHeader className="d-flex align-items-center">
          <FontAwesomeIcon icon={faChartLine} className="me-2 text-primary" />
          <span className="fw-bold">Analytics Dashboard</span>
        </CCardHeader>
        
        <CCardBody>
          {/* CoreUI Nav Pills */}
          <CNav variant="pills" className="mb-4">
            {insightButtons.map(button => (
              <CNavItem key={button.id}>
                <CNavLink 
                  active={activeInsight === button.id}
                  onClick={() => handleInsightChange(button.id)}
                  className={`d-flex align-items-center ${activeInsight === button.id ? `bg-${button.color} text-white` : ''}`}
                  style={{ cursor: 'pointer', margin: '0 0.25rem' }}
                >
                  <FontAwesomeIcon icon={button.icon} className="me-2" />
                  {button.label}
                </CNavLink>
              </CNavItem>
            ))}
          </CNav>

          {/* Loading indicator */}
          {!dataFetched && (
            <div className="text-center py-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Fetching data...</p>
            </div>
          )}

          {/* Insight Content Panel */}
          <CCard className="border-0 shadow-sm">
            <CCardBody>
              {dataFetched && renderActiveInsight()}
            </CCardBody>
          </CCard>
        </CCardBody>
      </CCard>
    </>
  );
};

export default CombinedInsights;