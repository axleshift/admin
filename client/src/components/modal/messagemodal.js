import React from 'react';
import PropTypes from 'prop-types';
import { CModal, CModalHeader, CModalBody, CModalFooter, CButton } from '@coreui/react';
import Message from '../../views/pages/scene/message'; // Import Message component

const MessageModal = ({ visible, onClose }) => {
  return (
    <CModal visible={visible} onClose={onClose}>
      <CModalHeader>Messages</CModalHeader>
      <CModalBody>
        <Message />
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>Close</CButton>
      </CModalFooter>
    </CModal>
  );
};

// Define PropTypes for validation
MessageModal.propTypes = {
  visible: PropTypes.bool.isRequired,  // Ensures visible is a boolean
  onClose: PropTypes.func.isRequired,  // Ensures onClose is a function
};

export default MessageModal;
