import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    CCard,
    CCardBody,
    CCardHeader,
    CTable,
    CTableBody,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableDataCell,
} from '@coreui/react';

const LogsPage = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const response = await axios.get('http://localhost:5053/try/logs');

            // Filter out logs related to '/logs/activity'
            const filteredLogs = response.data.filter(log => log.route !== '/logs/activity');

            setLogs(filteredLogs);
        } catch (error) {
            console.error('Error fetching logs:', error);
        }
    };

    return (
        <CCard>
            <CCardHeader>
                <h3>User Activity Logs</h3>
            </CCardHeader>
            <CCardBody>
                <CTable striped hover responsive>
                    <CTableHead>
                        <CTableRow>
                            <CTableHeaderCell>Username</CTableHeaderCell>
                            <CTableHeaderCell>Name</CTableHeaderCell>
                            <CTableHeaderCell>Department</CTableHeaderCell>
                            <CTableHeaderCell>Role</CTableHeaderCell>
                            <CTableHeaderCell>Route</CTableHeaderCell> 
                            <CTableHeaderCell>Action</CTableHeaderCell>
                            <CTableHeaderCell>Description</CTableHeaderCell>
                            <CTableHeaderCell>Timestamp</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>
                    <CTableBody>
                        {logs.map((log) => (
                            <CTableRow key={log._id}>
                                <CTableDataCell>{log.username}</CTableDataCell>
                                <CTableDataCell>{log.name}</CTableDataCell>
                                <CTableDataCell>{log.department}</CTableDataCell>
                                <CTableDataCell>{log.role}</CTableDataCell>
                                <CTableDataCell>{log.route}</CTableDataCell>
                                <CTableDataCell>{log.action}</CTableDataCell>
                                <CTableDataCell>{log.description}</CTableDataCell>
                                <CTableDataCell>{new Date(log.timestamp).toLocaleString()}</CTableDataCell>
                            </CTableRow>
                        ))}
                    </CTableBody>
                </CTable>
            </CCardBody>
        </CCard>
    );
};

export default LogsPage;
