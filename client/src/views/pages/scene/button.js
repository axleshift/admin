import React from 'react';
import { CButton } from '@coreui/react';
import { useSelector } from 'react-redux';
import { logActivity } from '../../../utils/logActivity';

const ExampleButtonPage = () => {
  const user = useSelector(state => state.auth?.user); 

  const handleClick = () => {
    if (user) {
      logActivity({
        userId: user.id,
        name: user.name,
        role: user.role,
        department: user.department,
        activity: 'Clicked the button'
      });
    }
  };

  return (
    <div>
      <CButton onClick={handleClick}>Click me</CButton>
    </div>
  );
};

export default ExampleButtonPage;
