import React from 'react';
import styled from 'styled-components';
import { CContainer } from '@coreui/react';

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

export default FlexBetween;
