import React, { useEffect, useState } from "react";
import { 
    CContainer, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, 
    CTableDataCell, CSpinner, CAlert 
} from "@coreui/react";
import axios from "axios";

const UserListPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await axios.get("https://external-system.com/api/users"); // Replace with actual API
            
            // ✅ Merge firstname and lastname into name
            const formattedUsers = response.data.map(user => ({
                ...user,
                name: `${user.firstname} ${user.lastname}`.trim(), // Merge names
            }));

            setUsers(formattedUsers);
        } catch (error) {
            console.error("Error fetching user data:", error);
            setError("Failed to load user data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CContainer className="mt-4">
            <h2>User List</h2>

            {error && <CAlert color="danger">{error}</CAlert>}

            {loading ? (
                <div className="text-center">
                    <CSpinner size="lg" />
                </div>
            ) : (
                <CTable hover responsive>
                    <CTableHead>
                        <CTableRow>
                            <CTableHeaderCell>Name</CTableHeaderCell>
                            <CTableHeaderCell>Email</CTableHeaderCell>
                            <CTableHeaderCell>Username</CTableHeaderCell>
                            <CTableHeaderCell>Role</CTableHeaderCell>
                            <CTableHeaderCell>Status</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>
                    <CTableBody>
                        {users.length > 0 ? (
                            users.map((user) => (
                                <CTableRow key={user.email}>
                                    <CTableDataCell>{user.name}</CTableDataCell>
                                    <CTableDataCell>{user.email}</CTableDataCell>
                                    <CTableDataCell>{user.username}</CTableDataCell>
                                    <CTableDataCell>{user.role}</CTableDataCell>
                                    <CTableDataCell>{user.status}</CTableDataCell>
                                </CTableRow>
                            ))
                        ) : (
                            <CTableRow>
                                <CTableDataCell colSpan="5" className="text-center">
                                    No users found.
                                </CTableDataCell>
                            </CTableRow>
                        )}
                    </CTableBody>
                </CTable>
            )}
        </CContainer>
    );
};

export default UserListPage;
