import { useState, useEffect } from 'react';
import api from '../../utils/apislice';

const usePersistentLogin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        try {
          const response = await api.get('/client/user');
          if (response.data.user) {
            const { _id, name, role, email, username, department } = response.data.user;
            
            // Store user data in session storage
            sessionStorage.setItem('userid', _id);
            sessionStorage.setItem('name', name);
            sessionStorage.setItem('role', role);
            sessionStorage.setItem('email', email);
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('department', department);
            
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Error validating token:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          sessionStorage.clear();
          setIsAuthenticated(false);
        }
      } else {
        sessionStorage.clear();
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    checkLogin();
  }, []); // Add an empty dependency array to run this effect only once

  return { isAuthenticated, loading };
};

export default usePersistentLogin;