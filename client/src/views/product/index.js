import React, { useState } from 'react'
import {
  CCard,
  CCardText,
  CCardBody,
  CCardFooter,
  CCardTitle,
  CCol,
  CRow,
  CContainer,
  CButton,
  CCollapse,
  CInputGroup,
  CFormInput,
} from '@coreui/react'
import CustomHeader from '../../components/header/customhead'
import { useGetProductsQuery } from '../../state/api'
import { useTheme } from '../../components/themecontext'
import useMediaQuery from '../../components/useMediaQuery'
import Typography from '../../views/theme/typography/Typography'
import StarRating from '../../components/StarRating'

const Product = ({
  _id,
  name,
  description,
  price,
  rating,
  category,
  supply,
  stat
}) => {
  const theme = useTheme()
  const [isExpanded, setIsExpanded] = useState(false)

  // Check for essential product properties
  if (!name || !category || !price) {
    return <p>Missing Product Data</p>
  }

  return (
    <CCard
      style={{
        backgroundImage: 'none',
        borderRadius: '0.55rem',
        margin: '10px'
      }}
    >
      <CCardBody>
        <CCardText style={{ fontSize: 14, marginBottom: '0.5rem' }}>
          {category || 'No category'}
        </CCardText>
        <CCardTitle style={{ fontSize: '1.25rem' }}>
          {name || 'Unnamed Product'}
        </CCardTitle>
        <CCardText style={{ marginBottom: '1.5rem' }}>
          ₱{price ? Number(price).toFixed(2) : 'N/A'}
        </CCardText>
        <StarRating value={rating || 0} readOnly />
        <CCardText variant="body2">{description || 'No description'}</CCardText>
      </CCardBody>
      <CCardFooter>
        <CButton
          color="primary"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)} // Toggle expanded state
        >
          {isExpanded ? 'See less' : 'See more'}
        </CButton>
      </CCardFooter>

      {/* Only render CCollapse if isExpanded is true */}
      {isExpanded && (
        <CCollapse in={isExpanded} timeout={300}>
          <CCardBody>
            <Typography>id: {_id || 'N/A'}</Typography>
            <Typography>Supply left: {supply || 'N/A'}</Typography>
            {stat && stat.length > 0 ? (
              <>
                <Typography>Yearly Sales This Year: {stat[0].yearlySalesTotal}</Typography>
                <Typography>Yearly Units Sold This Year: {stat[0].yearlyTotalSoldUnits}</Typography>
              </>
            ) : (
              <Typography>No statistics available for this product.</Typography>
            )}
          </CCardBody>
        </CCollapse>
      )}
    </CCard>
  )
}

// Index component remains unchanged
const Index = () => {
  const { data, isLoading } = useGetProductsQuery()
  const [searchTerm, setSearchTerm] = useState('')
  const isNonMobile = useMediaQuery("(min-width:1000px)")

  const filteredProducts = data?.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <CContainer m="1.5rem 2.5rem">
      <CRow>
        <CustomHeader title="PRODUCT" subtitle="List of products" />

        <CInputGroup className="mb-3">
          <CFormInput
            placeholder="Search by Name or Category"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CInputGroup>

        {data && !isLoading ? (
          <CRow
            className="mt-3 d-grid"
            style={{
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              justifyContent: "space-between",
              rowGap: "20px",
              columnGap: "1.33%",
            }}
          >
            {(filteredProducts.length > 0 ? filteredProducts : data).map(({
              _id,
              name,
              description,
              price,
              rating,
              category,
              supply,
              stat
            }) => (
              <Product
                key={_id}
                _id={_id}
                name={name}
                description={description}
                price={price}
                rating={rating}
                category={category}
                supply={supply}
                stat={stat}
              />
            ))}
          </CRow>
        ) : (
          <>Loading...</>
        )}
      </CRow>
    </CContainer>
  )
}

export default Index
