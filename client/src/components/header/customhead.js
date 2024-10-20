import React from 'react'; // Import React
import { CCard, CCardBody, CCardTitle, CCardText } from '@coreui/react'; // Use single quotes

import PropTypes from 'prop-types'; // Import prop-types for validation

const CustomHeader = ({ title, subtitle }) => { // Accept title and subtitle as props
    return ( // Return the JSX
        <CCard>
            <CCardBody>
                <CCardTitle>{title}</CCardTitle> {/* Display the title */}
                <CCardText>{subtitle}</CCardText> {/* Display the subtitle */}
            </CCardBody>
        </CCard>
    );
};

CustomHeader.propTypes = {
    title: PropTypes.string.isRequired, // Validate title as required string
    subtitle: PropTypes.string.isRequired, // Validate subtitle as required string
};

export default CustomHeader; // Export the component
