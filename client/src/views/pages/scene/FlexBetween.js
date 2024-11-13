import React from 'react';
import styled from 'styled-components';
import { CContainer } from '@coreui/react';
import PropTypes from 'prop-types';

const StyledContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FlexBetween = (props) => (
  <CContainer>
    <StyledContainer>{props.children}</StyledContainer>
  </CContainer>
);

FlexBetween.propTypes = {
  children: PropTypes.node.isRequired,
};

export default FlexBetween;
