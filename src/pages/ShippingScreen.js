import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import CheckoutSteps from '../components/CheckoutSteps';

const ShippingScreen = () => {
  // Check if there is already an address in localStorage
  const savedAddress = JSON.parse(localStorage.getItem('shippingAddress')) || {};

  const [address, setAddress] = useState(savedAddress.address || '');
  const [city, setCity] = useState(savedAddress.city || '');
  const [postalCode, setPostalCode] = useState(savedAddress.postalCode || '');
  const [country, setCountry] = useState(savedAddress.country || '');

  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    // Save to localStorage
    localStorage.setItem('shippingAddress', JSON.stringify({ address, city, postalCode, country }));
    // Move to next step
    navigate('/placeorder');
  };

  return (
    <Container>
      <CheckoutSteps step1 step2 />
      <Row className='justify-content-md-center'>
        <Col xs={12} md={6}>
          <h1 className="mb-4 text-uppercase">Shipping</h1>
          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3" controlId='address'>
              <Form.Label>Address</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter address'
                value={address}
                required
                onChange={(e) => setAddress(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId='city'>
              <Form.Label>City</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter city'
                value={city}
                required
                onChange={(e) => setCity(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId='postalCode'>
              <Form.Label>Postal Code</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter postal code'
                value={postalCode}
                required
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId='country'>
              <Form.Label>Country</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter country'
                value={country}
                required
                onChange={(e) => setCountry(e.target.value)}
              />
            </Form.Group>

            <Button type='submit' variant='dark' className="w-100 py-2">
              Continue to Payment
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default ShippingScreen;