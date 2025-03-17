import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CFormSelect,
} from '@coreui/react'
import {
  faBox,
  faCalendar,
  faUser,
  faWeightHanging,
  faMapMarkedAlt,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useCreateShippingMutation } from '../../../state/adminApi'

const Shipping = () => {
  const landCargoOptions = [
    { id: 1, name: 'Dry Van', volume: 4000, image: '/img/dryvan.jpeg' },
    { id: 2, name: 'Box Truck', volume: 6000, image: '/img/boxtruck.jpeg' },
    { id: 3, name: 'Flatbed Truck', volume: 4800, image: '/img/flatbed.jpeg' },
  ]

  const seaCargoOptions = [
    { id: 1, name: 'Container Ship', volume: 100000, image: '/img/containership.jpeg' },
    { id: 2, name: 'Bulk Carrier', volume: 400000, image: '/img/bulkcarrier.jpeg' },
    { id: 3, name: 'Roro Vessel', volume: 6000, image: '/img/rorovessel.jpeg' },
  ]

  const airCargoOptions = [
    { id: 1, name: 'Boeing 747-400F', volume: 100000, image: '/img/boeing747.jpeg' },
    { id: 2, name: 'Airbus A300-600F', volume: 40000, image: '/img/airbusa300.jpeg' },
    { id: 3, name: 'McDonnell Douglas MD-11F', volume: 90000, image: '/img/mcdonnel.jpeg' },
  ]

  const countryOptions = [
    { value: 'china', label: 'China', dropOffLocation: 'Shanghai Port' },
    { value: 'usa', label: 'USA', dropOffLocation: 'Los Angeles Port' },
    { value: 'germany', label: 'Germany', dropOffLocation: 'Hamburg Port' },
  ]

  const [customerName, setCustomerName] = useState('')
  const [orderVolume, setOrderVolume] = useState('')
  const [orderDate, setOrderDate] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [shippingType, setShippingType] = useState('land')
  const [selectedCargo, setSelectedCargo] = useState(landCargoOptions[0])
  const [destinationCountry, setDestinationCountry] = useState('china')
  const [dropOffLocation, setDropOffLocation] = useState('Shanghai Port')
  const [status, setStatus] = useState('pending')
  const [error, setError] = useState('')

  const [createShipping, { isLoading }] = useCreateShippingMutation()

  const handleCargoChange = (e) => {
    const cargoId = parseInt(e.target.value)
    const cargoOptions = getCargoOptions()
    const cargo = cargoOptions.find((option) => option.id === cargoId)
    setSelectedCargo(cargo)
  }

  const getCargoOptions = () => {
    switch (shippingType) {
      case 'sea':
        return seaCargoOptions
      case 'air':
        return airCargoOptions
      case 'land':
      default:
        return landCargoOptions
    }
  }

  const getDropOffLocation = () => {
    return dropOffLocation || 'Unknown location'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!customerName || !orderVolume || !orderDate || !shippingType || !destinationCountry) {
      setError('Please fill in all fields.')
      return
    }

    try {
      await createShipping({
        customerName,
        orderVolume,
        orderDate,
        deliveryDate,
        shippingType,
        dropOffLocation,
        status,
      })
      alert('Shipping details submitted successfully!')
      setCustomerName('')
      setOrderVolume('')
      setOrderDate('')
      setDeliveryDate('')
      setShippingType('land')
      setSelectedCargo(landCargoOptions[0])
      setDestinationCountry('china')
      setDropOffLocation('Shanghai Port') 
      setStatus('pending')
    } catch (error) {
      console.error('Failed to submit shipping details:', error)
      setError('An error occurred while submitting shipping details.')
    }
  }

  return (
    <div>
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm onSubmit={handleSubmit}>
                  <h1>Shipment Request</h1>
                  {error && <p style={{ color: 'red' }}>{error}</p>}

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <FontAwesomeIcon icon={faUser} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Customer Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <FontAwesomeIcon icon={faWeightHanging} />
                    </CInputGroupText>
                    <CFormInput
                      type="number"
                      placeholder="Order Volume (kg)"
                      value={orderVolume}
                      onChange={(e) => setOrderVolume(e.target.value)}
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <FontAwesomeIcon icon={faCalendar} />
                    </CInputGroupText>
                    <CFormInput
                      type="date"
                      value={orderDate}
                      onChange={(e) => setOrderDate(e.target.value)}
                    />
                    <span style={{ marginLeft: '10px', alignSelf: 'center' }}>Order Date</span>
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <FontAwesomeIcon icon={faBox} />
                    </CInputGroupText>
                    <CFormInput
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                    />
                    <span style={{ marginLeft: '10px', alignSelf: 'center' }}>Delivery Date</span>
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CFormSelect
                      value={shippingType}
                      onChange={(e) => {
                        setShippingType(e.target.value)
                        setSelectedCargo(getCargoOptions()[0]) 
                      }}
                    >
                      <option value="land">Land Freight</option>
                      <option value="sea">Sea Freight</option>
                      <option value="air">Air Freight</option>
                    </CFormSelect>
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CFormSelect onChange={handleCargoChange}>
                      {getCargoOptions().map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </CFormSelect>
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CFormSelect
                      value={destinationCountry}
                      onChange={(e) => {
                        setDestinationCountry(e.target.value)
                        const selectedCountry = countryOptions.find(
                          (country) => country.value === e.target.value,
                        )
                        setDropOffLocation(selectedCountry?.dropOffLocation || '') 
                      }}
                    >
                      {countryOptions.map((country) => (
                        <option key={country.value} value={country.value}>
                          {country.label}
                        </option>
                      ))}
                    </CFormSelect>
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <FontAwesomeIcon icon={faMapMarkedAlt} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Custom Drop-off Location"
                      value={dropOffLocation}
                      onChange={(e) => setDropOffLocation(e.target.value)}
                    />
                  </CInputGroup>

                  <div className="mb-3">
                    <img
                      src={selectedCargo.image}
                      alt={selectedCargo.name}
                      style={{ width: '150px', marginTop: '10px' }}
                    />
                    <p>{`${selectedCargo.name} can carry up to ${selectedCargo.volume} kg.`}</p>
                  </div>

                  <CButton color="primary" type="submit" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Submit'}
                  </CButton>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Shipping
