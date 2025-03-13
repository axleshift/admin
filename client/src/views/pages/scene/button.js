import React from 'react';
import { CButton } from '@coreui/react';
import { useSelector } from 'react-redux';

const ExampleButtonPage = () => {
  const user = useSelector(state => state.auth?.user); 



  return (
    <div>
      <CButton>Click me</CButton>
    </div>
  );
};

export default ExampleButtonPage;
