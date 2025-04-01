import React, { useState } from "react";
import { 
  CCard, 
  CCardHeader, 
  CCardBody, 
  CNav, 
  CNavItem, 
  CNavLink, 
  CRow, 
  CCol 
} from "@coreui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBox, 
  faDollarSign, 
  faWeight, 
  faBoxes, 
  faChartLine 
} from "@fortawesome/free-solid-svg-icons";
import InsightShipment from "./core analysys overtime/insightShipment";
import InsightCost from "./core analysys overtime/insightCost";
import InsightItem from "./core analysys overtime/insightItem";
import InsightWeight from "./core analysys overtime/insightWeight";

const CombinedInsights = () => {
  // State to track which insight is currently active
  const [activeInsight, setActiveInsight] = useState("shipment");

  // Button configuration data
  const insightButtons = [
    { id: "shipment", label: "Shipment", icon: faBox, color: "success" },
    { id: "cost", label: "Cost", icon: faDollarSign, color: "primary" },
    { id: "weight", label: "Weight", icon: faWeight, color: "warning" },
    { id: "item", label: "Item", icon: faBoxes, color: "purple" }
  ];

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
                onClick={() => setActiveInsight(button.id)}
                className={`d-flex align-items-center ${activeInsight === button.id ? `bg-${button.color} text-white` : ''}`}
                style={{ cursor: 'pointer', margin: '0 0.25rem' }}
              >
                <FontAwesomeIcon icon={button.icon} className="me-2" />
                {button.label}
              </CNavLink>
            </CNavItem>
          ))}
        </CNav>

        {/* Insight Content Panel */}
        <CCard className="border-0 shadow-sm">
          <CCardBody>
            {renderActiveInsight()}
          </CCardBody>
        </CCard>
      </CCardBody>
    </CCard>
  );
};

export default CombinedInsights;