import React from 'react';
import { CModal, CModalHeader, CModalBody, CModalFooter, CButton } from '@coreui/react';
import Message from '../../views/pages/scene/message'; // Import your existing Message component

const MessageModal = ({ visible, onClose }) => {
  return (
    <CModal visible={visible} onClose={onClose}>
      <CModalHeader>Messages</CModalHeader>
      <CModalBody>
        <Message />
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          Close
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default MessageModal;
