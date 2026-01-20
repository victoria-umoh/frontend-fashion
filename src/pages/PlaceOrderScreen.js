import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Row, Col, ListGroup, Image, Card, Container, Form, InputGroup, Badge } from 'react-bootstrap';
import { useCart } from '../components/context/CartContext';
import CheckoutSteps from '../components/CheckoutSteps';
import API from '../api';
import swal from 'sweetalert';
import { toast } from 'react-toastify';
import PaystackPop from '@paystack/inline-js';
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

const PlaceOrderScreen = () => {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('Paystack');
  const [isPlacing, setIsPlacing] = useState(false);
  
  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isApplying, setIsApplying] = useState(false);

  const shippingAddress = JSON.parse(localStorage.getItem('shippingAddress'));
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  // --- Optimized Price Calculations ---
  const { itemsPrice, discountPrice, shippingPrice, taxPrice, totalPrice } = useMemo(() => {
    const toNum = (num) => Number((Math.round(num * 100) / 100).toFixed(2));
    
    // Calculate subtotal using promoPrice if item is on sale
    const sub = cartItems.reduce((acc, item) => {
      const price = item.onSale ? item.promoPrice : item.price;
      return acc + price * item.qty;
    }, 0);

    // Use discountAmount from backend if available
    let discount = 0;
    if (appliedCoupon) {
      if (typeof appliedCoupon.discountAmount === 'number') {
        discount = toNum(appliedCoupon.discountAmount);
      } else if (typeof appliedCoupon.discount === 'number') {
        discount = toNum((appliedCoupon.discount / 100) * sub);
      }
    }
    const shipping = sub > 100 ? 0 : 10;
    const tax = toNum(0.15 * (sub - discount));
    const total = toNum(sub - discount + shipping + tax);

    return { itemsPrice: toNum(sub), discountPrice: discount, shippingPrice: shipping, taxPrice: tax, totalPrice: total };
  }, [cartItems, appliedCoupon]);

  const applyCouponHandler = async () => {
    if (!couponCode) return;
    setIsApplying(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
      // Send cartTotal to backend for accurate discount calculation
      const { data } = await API.post('/api/coupons/validate', { name: couponCode, cartTotal: itemsPrice }, config);
      setAppliedCoupon(data);
      swal("Applied!", `${data.discount}% discount has been added.`, "success");
    } catch (err) {
      swal("Error", err.response?.data?.message || "Invalid Code", "error");
    } finally {
      setIsApplying(false);
    }
  };

  const createOrderRecord = async (paymentDetails = {}) => {
  try {
    const config = {
      headers: { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${userInfo.token}` 
      },
    };

    const { data } = await API.post('/api/orders', {
      orderItems: cartItems.map(item => ({
        name: item.name,
        qty: item.qty,
        image: item.image,
        price: item.onSale ? item.promoPrice : item.price,
        size: item.size,
        product: item._id,
      })),
      shippingAddress,
      paymentMethod,
      couponCode: appliedCoupon?.name, 
      itemsPrice,
      discountPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      isPaid: paymentMethod !== 'COD',
      paymentResult: paymentDetails,
    }, config);

    return data;
  } catch (err) {
    // PLACE IT HERE
    const message = err.response?.data.message || 'Error placing order';
    toast.error(message); // Displays the "Out of Stock" or "Server Error" message
    
    return null; // Prevents the rest of the flow (like clearing cart) from running
  }
};

  const handlePaystackResponse = async (response) => {
    const order = await createOrderRecord({ id: response.reference, status: 'success' });
    if (order) {
      clearCart();
      navigate('/success', { state: { orderId: order._id } });
    }
  };

  const handlePaystack = () => {
    const handler = new PaystackPop();
    handler.open({
      key: 'pk_test_YOUR_PAYSTACK_KEY',
      email: userInfo.email,
      amount: Math.round(totalPrice * 1500 * 100), // NGN Conversion
      currency: 'NGN',
      callback: function(response) {
        handlePaystackResponse(response);
      },
      onClose: () => swal("Cancelled", "Payment closed", "info"),
    });
  };

  const handlePlaceOrder = async () => {
    setIsPlacing(true);
    if (paymentMethod === 'COD') {
      const order = await createOrderRecord();
      if (order) {
          clearCart();
          navigate('/success', { state: { orderId: order._id } });
      }
    } else if (paymentMethod === 'Paystack') {
      handlePaystack();
    }
    setIsPlacing(false);
  };

  return (
    <Container className="py-4">
      <CheckoutSteps step1 step2 step4 />
      <Row>
        <Col md={8}>
          <ListGroup variant='flush'>
            <Card className="border-0 shadow-sm mb-3 rounded-4 p-3">
              <h5 className="fw-bold text-uppercase mb-2 text-primary">1. Delivery Address</h5>
              <p className="text-muted mb-0">{shippingAddress.address}, {shippingAddress.city}, {shippingAddress.country}</p>
            </Card>

            <Card className="border-0 shadow-sm mb-3 rounded-4 p-3">
              <h5 className="fw-bold text-uppercase mb-3 text-primary">2. Payment Method</h5>
              <div className="d-flex gap-4">
                {['Paystack', 'PayPal', 'COD'].map((method) => (
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

            <Card className="border-0 shadow-sm rounded-4 p-3">
              <h5 className="fw-bold text-uppercase mb-3 text-primary">3. Review Items</h5>
              {cartItems.map((item, index) => (
                <Row key={index} className="align-items-center mb-3">
                  <Col xs={2}><Image src={item.image} alt={item.name} fluid rounded /></Col>
                  <Col className="fw-bold">
                    {item.name}
                    {item.size && <Badge bg="info" text="dark" className="ms-2">Size: {item.size}</Badge>}
                  </Col>
                  <Col xs={4} className="text-end">{item.qty} x ${item.onSale ? item.promoPrice : item.price}</Col>
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
                        disabled={appliedCoupon}
                    />
                    <Button 
                        variant={appliedCoupon ? "success" : "dark"} 
                        onClick={appliedCoupon ? () => {setAppliedCoupon(null); setCouponCode('')} : applyCouponHandler}
                        disabled={isApplying}
                    >
                        {appliedCoupon ? 'REMOVE' : (isApplying ? '...' : 'APPLY')}
                    </Button>
                </InputGroup>
            </div>

            <div className="d-flex justify-content-between mb-2"><span>Subtotal</span><span>${itemsPrice}</span></div>

            {appliedCoupon && (
                <div className="d-flex justify-content-between mb-2 text-success fw-bold">
                    <span>Discount ({appliedCoupon.discount}%)</span>
                    <span>-${discountPrice}</span>
                </div>
            )}

            <div className="d-flex justify-content-between mb-2"><span>Shipping</span><span>${shippingPrice}</span></div>
            <div className="d-flex justify-content-between mb-2"><span>Tax (15%)</span><span>${taxPrice}</span></div>
            
            <div className="d-flex justify-content-between mb-4 fw-bold h4 pt-3 border-top">
                <span>Total</span>
                <span className="text-primary">${totalPrice}</span>
            </div>

            {paymentMethod === 'PayPal' ? (
              <PayPalScriptProvider options={{ "client-id": "YOUR_PAYPAL_CLIENT_ID", components: "buttons" }}>
                <PayPalButtons 
                  style={{ layout: "vertical", shape: "pill" }}
                  createOrder={(data, actions) => actions.order.create({ 
                    purchase_units: [{ amount: { value: totalPrice.toString() } }] 
                  })}
                  onApprove={async (data, actions) => {
                    const details = await actions.order.capture();
                    const order = await createOrderRecord(details);
                    if (order) {
                        clearCart();
                        navigate('/success', { state: { orderId: order._id } });
                    }
                  }}
                />
              </PayPalScriptProvider>
            ) : (
              <Button 
                variant="dark"
                className='w-100 py-3 rounded-pill fw-bold' 
                onClick={handlePlaceOrder}
                disabled={isPlacing || cartItems.length === 0}
              >
                {isPlacing ? 'PROCESSING...' : (paymentMethod === 'COD' ? 'PLACE ORDER (COD)' : `PAY $${totalPrice}`)}
              </Button>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PlaceOrderScreen;