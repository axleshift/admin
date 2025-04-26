import React from 'react';
import PropTypes from 'prop-types';
import { 
  CCard, 
  CCardBody, 
  CSpinner
} from '@coreui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const StatBox = ({ title, value, icon, description, loading, color = 'primary', children }) => {
  // Determine the color class for the icon background
  const getIconColorClass = () => {
    switch (color) {
      case 'success': return 'text-success';
      case 'info': return 'text-info';
      case 'warning': return 'text-warning';
      case 'danger': return 'text-danger';
      default: return 'text-primary';
    }
  };

  return (
    <CCard className="border-0 shadow-sm h-100">
      <CCardBody className="d-flex align-items-center">
        {/* Icon section with background */}
        <div className={`${getIconColorClass()} bg-light rounded-circle p-3 me-3`}>
          {React.isValidElement(icon) ? (
            React.cloneElement(icon, { size: '2x' })
          ) : (
            <FontAwesomeIcon icon={icon || 'chart-bar'} size="2x" />
          )}
        </div>
        
        {/* Content section */}
        <div className={children ? 'w-100' : ''}>
          <h6 className="text-muted mb-1">{title}</h6>
          <h3 className="mb-0">
            {loading ? <CSpinner size="sm" /> : value}
          </h3>
          {description && <small className="text-muted">{description}</small>}
          
          {/* Optional additional content */}
          {children && <div className="mt-2">{children}</div>}
        </div>
      </CCardBody>
    </CCard>
  );
};

// Add PropTypes validation
StatBox.propTypes = {
  title: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.node
  ]),
  icon: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.node
  ]),
  description: PropTypes.string,
  loading: PropTypes.bool,
  color: PropTypes.oneOf(['primary', 'success', 'info', 'warning', 'danger']),
  children: PropTypes.node
};

export default StatBox;