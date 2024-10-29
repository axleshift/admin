import { useNavigate } from "react-router-dom";
import React, { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/login');
  }, [navigate]);

  return (
    <div>
      Redirecting to login...
    </div>
  );
};

export default Index;
