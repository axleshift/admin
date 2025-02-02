import { useEffect } from 'react';
import api from '../../util/apislice'; // Axios instance

const usePersistentLogin = () => {
  useEffect(() => {
    const checkLogin = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        try {
          const response = await api.get('/client/user'); // Validate token with backend
          if (response.data.user) {
            const { name, role, email, username, department } = response.data.user;

            // Store user details in sessionStorage
            sessionStorage.setItem('name', name || '');
            sessionStorage.setItem('role', role || '');
            sessionStorage.setItem('email', email || '');
            sessionStorage.setItem('username', username || '');
            sessionStorage.setItem('department', department || ''); // Save department
          }
        } catch (error) {
          console.error('Error validating token:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
    };

    checkLogin();
  }, []);
};

export default usePersistentLogin;
