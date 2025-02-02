import React, { useState } from 'react';
import { CButton, CCard, CCardBody, CCardHeader } from '@coreui/react';
import ActivityTracker from '../../../util/ActivityTracker'; // Ensure this path is correct

const CustomButton = () => {
  const [buttonClicked, setButtonClicked] = useState(false);

  const handleClick = () => {
    console.log("🖱️ Button clicked! Activity will be logged.");
    setButtonClicked(true); // Set state when button is clicked
  };

  return (
    <CCard>
      <CCardHeader>
        Custom Button with Activity Tracker
      </CCardHeader>
      <CCardBody>
        <div>
          {/* Track button click activity */}
          {buttonClicked && (
            <ActivityTracker
              action="Button Click"
              description="The 'Click Me' button was clicked"
            />
          )}

          {/* CoreUI Button */}
          <CButton color="primary" onClick={handleClick}>Click Me</CButton>
        </div>
      </CCardBody>
    </CCard>
  );
};

export default CustomButton;
