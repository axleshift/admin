import React, { useState, useEffect } from "react";
import { CCard, CCardBody, CCardHeader, CCol, CRow } from "@coreui/react";
import CustomHeader from "../../../components/header/customhead";
import OverviewChart from "./overviewChart";
import { useGetSalesQuery } from "../../../state/api"; // Adjust the import path as needed

const Overview = ({isDashboard = false}) => {
  const [view, setView] = useState("units");

  // Fetch data using the Redux Toolkit query hook
  const { data: salesData, isLoading, error } = useGetSalesQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <CRow>
      <CCol xs={12} md={12}>
        <CCard>
          <CCardHeader>
            <CustomHeader title="Overview" subtitle="Overview of general revenue and profit" />
          </CCardHeader>
          <CCardBody>
            <CRow className="mb-3">
              <CCol xs={12} md={6}>
                <label htmlFor="viewSelect">View</label>
                <select
                  id="viewSelect"
                  value={view}
                  onChange={(e) => setView(e.target.value)}
                  className="form-select"
                  aria-label="Select view"
                >
                  <option value="sales">Sales</option>
                  <option value="units">Units</option>
                </select>
              </CCol>
            </CRow>
            <OverviewChart view={view} salesData={salesData} />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Overview;
