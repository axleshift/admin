import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../utils/axiosInstance';

export default function IncidentReportUpload() {
  const [incidentReports, setIncidentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIncidentReports = async () => {
      try {
        const response = await axiosInstance.get('/incidentreport/incidentall');
        console.log('API Response:', response.data);

        const data = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];

        setIncidentReports(data);
      } catch (err) {
        setError('Failed to fetch incident reports');
      } finally {
        setLoading(false);
      }
    };

    fetchIncidentReports();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-4xl w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">All Incident Reports</h1>

        {loading && <p className="text-center text-gray-500">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && Array.isArray(incidentReports) && incidentReports.length === 0 && (
          <p className="text-center text-gray-500">No incident reports found.</p>
        )}

        {!loading && !error && Array.isArray(incidentReports) && incidentReports.length > 0 && (
          <ul className="divide-y divide-gray-200">
            {incidentReports.map((report, index) => (
              <li key={index} className="py-4">
                <div className="text-lg font-semibold text-gray-800">{report.title || 'Untitled Report'}</div>
                <div className="text-sm text-gray-600">{report.description || 'No description provided.'}</div>
                <div className="text-sm text-gray-500 mt-1">
                  <strong>Location:</strong> {report.location || 'N/A'} | <strong>Severity:</strong> {report.severity || 'N/A'} | <strong>Status:</strong> {report.status || 'N/A'}
                </div>
                <div className="text-sm text-gray-400">
                  Reported On: {report.reportDate ? new Date(report.reportDate).toLocaleDateString() : 'Unknown'}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}