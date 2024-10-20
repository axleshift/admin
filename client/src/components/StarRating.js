import React from 'react'
import CIcon from '@coreui/icons-react' // CoreUI icons
import { cilStar, cilStarHalf } from '@coreui/icons' // CoreUI star icons
import PropTypes from 'prop-types' // Import prop-types for validation

const StarRating = ({ value }) => {
  const stars = []

  for (let i = 1; i <= 5; i++) {
    if (value >= i) {
      // Full star (gold)
      stars.push(
        <CIcon
          key={i}
          icon={cilStar}
          style={{ color: 'gold' }} // Gold color for full star
        />,
      )
    } else if (value >= i - 0.5) {
      // Half star (light gold)
      stars.push(
        <CIcon
          key={i}
          icon={cilStarHalf}
          style={{ color: '#FFD700' }} // Light gold color for half star
        />,
      )
    } else {
      // Empty star (grey)
      stars.push(
        <CIcon
          key={i}
          icon={cilStar}
          style={{ color: 'lightgrey' }} // Grey color for empty star
        />,
      )
    }
  }

  return <div>{stars}</div>
}

// PropTypes validation for 'value' prop
StarRating.propTypes = {
  value: PropTypes.number.isRequired,
}

export default StarRating
