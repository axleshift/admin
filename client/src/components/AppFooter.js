import React from 'react'
import { CButton, CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <CButton>hi</CButton>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
