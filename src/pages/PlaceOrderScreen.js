import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Row, Col, ListGroup, Image, Card, Container, Form, InputGroup, Badge } from 'react-bootstrap';
import { useCart } from '../components/context/CartContext';
import CheckoutSteps from '../components/CheckoutSteps';
import API, { getImageUrl } from '../api';
import swal from 'sweetalert';
import { toast } from 'react-toastify';
import formatCurrency from '../utils/formatCurrency';

const readStoredValue = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    localStorage.removeItem(key);
    return null;
  }
};

const PlaceOrderScreen = () => {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [shippingAddress] = useState(() => readStoredValue('shippingAddress'));
  const [userInfo] = useState(() => readStoredValue('userInfo'));
  const hasShippingAddress = Boolean(
    shippingAddress?.address && shippingAddress?.city
      && shippingAddress?.postalCode && shippingAddress?.country
  );

  const [paymentMethod, setPaymentMethod] = useState('Paystack');
  const [isPlacing, setIsPlacing] = useState(false);
  
  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState('');
  const checkoutItems = useMemo(() => cartItems.map((item) => ({
    product: item._id,
    qty: item.qty,
    size: item.size,
    color: item.color,
  })), [cartItems]);

  useEffect(() => {
    if (!userInfo?.token) {
      navigate('/login', { replace: true });
    } else if (!hasShippingAddress) {
      navigate('/shipping', { replace: true });
    } else if (cartItems.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [cartItems.length, hasShippingAddress, navigate, userInfo]);

  useEffect(() => {
    if (!userInfo?.token || checkoutItems.length === 0) return undefined;
    let active = true;
    setQuote(null);
    setQuoteError('');
    API.post('/api/orders/quote', {
      orderItems: checkoutItems,
      couponCode: appliedCoupon?.name,
    }, {
      headers: { Authorization: `Bearer ${userInfo.token}` },
    }).then(({ data }) => {
      if (active) setQuote(data);
    }).catch((error) => {
      if (active) setQuoteError(error.response?.data?.message || 'Unable to calculate your order total.');
    });
    return () => {
      active = false;
    };
  }, [appliedCoupon?.name, checkoutItems, userInfo?.token]);

  const itemsPrice = quote?.itemsPrice || 0;
  const discountPrice = quote?.discountAmount || 0;
  const shippingPrice = quote?.shippingPrice || 0;
  const taxPrice = quote?.taxPrice || 0;
  const totalPrice = quote?.totalPrice || 0;

  const applyCouponHandler = async () => {
    if (!couponCode) return;
    setIsApplying(true);
    try {
      const { data } = await API.post('/api/orders/quote', {
        orderItems: checkoutItems,
        couponCode,
      }, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setQuote(data);
      setAppliedCoupon({ name: data.couponCode, discount: data.discountPercent });
      swal('Applied!', `${data.discountPercent}% discount has been added.`, 'success');
    } catch (err) {
      swal('Error', err.response?.data?.message || 'Invalid code', 'error');
    } finally {
      setIsApplying(false);
    }
  };

  const orderPayload = {
    orderItems: checkoutItems,
    shippingAddress,
    couponCode: appliedCoupon?.name,
  };

  const handlePlaceOrder = async () => {
    setIsPlacing(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      if (paymentMethod === 'COD') {
        const { data: order } = await API.post('/api/orders', {
          ...orderPayload,
          paymentMethod: 'COD',
        }, config);
        clearCart();
        navigate('/success', { state: { orderId: order._id, paymentMethod: 'COD' } });
      } else {
        const { data } = await API.post('/api/payments/initialize', orderPayload, config);
        window.location.assign(data.authorizationUrl);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to place your order.');
    } finally {
      setIsPlacing(false);
    }
  };

  if (!userInfo?.token || !hasShippingAddress || cartItems.length === 0) {
    return null;
  }

  return (
    <Container className="py-4">
      <CheckoutSteps step1 step2 step4 />
      <Row>
        <Col md={8}>
          <ListGroup variant='flush'>
            <Card className="commerce-card mb-3 p-3">
              <h5 className="fw-bold text-uppercase mb-2 text-primary">1. Delivery Address</h5>
              <p className="text-muted mb-0">{shippingAddress.address}, {shippingAddress.city}, {shippingAddress.country}</p>
            </Card>

            <Card className="commerce-card mb-3 p-3">
              <h5 className="fw-bold text-uppercase mb-3 text-primary">2. Payment Method</h5>
              <div className="d-flex gap-4">
                {['Paystack', 'COD'].map((method) => (
                  <Form.Check 
                    key={method}
                    type='radio' 
                    label={method === 'COD' ? 'Cash on Delivery' : method} 
                    id={method} 
                    name='paymentMethod' 
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                    className="fw-bold"
                  />
                ))}
              </div>
            </Card>

            <Card className="commerce-card p-3">
              <h5 className="fw-bold text-uppercase mb-3 text-primary">3. Review Items</h5>
              {(quote?.orderItems || cartItems).map((item, index) => (
                <Row key={index} className="align-items-center mb-3">
                  <Col xs={2}><Image src={getImageUrl(item.image)} alt={item.name} fluid rounded /></Col>
                  <Col className="fw-bold">
                    {item.name}
                    {item.size && <Badge bg="info" text="dark" className="ms-2">Size: {item.size}</Badge>}
                    {item.color && <Badge bg="light" text="dark" className="ms-2">Colour: {item.color}</Badge>}
                  </Col>
                  <Col xs={4} className="text-end">{item.qty} × {formatCurrency(item.price)}</Col>
                </Row>
              ))}
            </Card>
          </ListGroup>
        </Col>

        <Col md={4}>
          <Card className="border-0 shadow-sm p-4 bg-white rounded-4 sticky-top" style={{ top: '20px' }}>
            <h4 className="fw-bold border-bottom pb-3 mb-4">Order Summary</h4>
            
            {/* Coupon Section */}
            <div className="mb-4">
                <Form.Label className="small fw-bold text-muted uppercase">Have a coupon?</Form.Label>
                <InputGroup size="sm">
                    <Form.Control 
                        placeholder="Enter Code" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        disabled={Boolean(appliedCoupon)}
                    />
                    <Button 
                        variant={appliedCoupon ? "success" : "dark"} 
                        onClick={appliedCoupon ? () => { setAppliedCoupon(null); setCouponCode(''); } : applyCouponHandler}
                        disabled={isApplying}
                    >
                        {appliedCoupon ? 'REMOVE' : (isApplying ? '...' : 'APPLY')}
                    </Button>
                </InputGroup>
            </div>

            {quoteError && <Alert variant="danger">{quoteError}</Alert>}
            {!quote && !quoteError && <p className="small text-muted">Calculating your order total…</p>}
            <div className="d-flex justify-content-between mb-2"><span>Subtotal</span><span>{formatCurrency(itemsPrice)}</span></div>

            {appliedCoupon && (
                <div className="d-flex justify-content-between mb-2 text-success fw-bold">
                    <span>Discount ({appliedCoupon.discount}%)</span>
                    <span>-{formatCurrency(discountPrice)}</span>
                </div>
            )}

            <div className="d-flex justify-content-between mb-2"><span>Shipping</span><span>{formatCurrency(shippingPrice)}</span></div>
            <div className="d-flex justify-content-between mb-2"><span>Tax</span><span>{formatCurrency(taxPrice)}</span></div>
            
            <div className="d-flex justify-content-between mb-4 fw-bold h4 pt-3 border-top">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(totalPrice)}</span>
            </div>

            <Button
              variant="dark"
              className='w-100 py-3 rounded-pill fw-bold'
              onClick={handlePlaceOrder}
              disabled={isPlacing || !quote || Boolean(quoteError) || cartItems.length === 0}
            >
              {isPlacing ? 'PROCESSING...' : (paymentMethod === 'COD' ? 'PLACE ORDER (COD)' : `PAY ${formatCurrency(totalPrice)}`)}
            </Button>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PlaceOrderScreen;