import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Row } from 'react-bootstrap';
import CheckoutSteps from '../components/CheckoutSteps';

const PaymentScreen = () => {
  const navigate = useNavigate();
  const shippingAddress = JSON.parse(localStorage.getItem('shippingAddress'));

  useEffect(() => {
    if (!shippingAddress) navigate('/shipping');
  }, [shippingAddress, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    // Force Paystack as the exclusive method
    localStorage.setItem('paymentMethod', 'Paystack'); 
    navigate('/placeorder');
  };

  return (
    <Container className="py-5">
      <CheckoutSteps step1 step2 step3 />
      <Row className='justify-content-md-center'>
        <Col xs={12} md={6} className="text-center">
          <h1 className="mb-4 text-uppercase fw-bold">Payment Method</h1>
          <p className="text-muted mb-4">Secure payment via Paystack (Cards, Bank Transfer, USSD).</p>
          <form onSubmit={submitHandler}>
             <Button type='submit' variant='dark' className="w-100 py-3 rounded-pill fw-bold">
              Continue to Place Order
            </Button>
          </form>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentScreen;