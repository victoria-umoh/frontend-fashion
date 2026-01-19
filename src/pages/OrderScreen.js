import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Container, Button, Badge } from 'react-bootstrap';
import API from '../api';
import swal from 'sweetalert';
// import PaystackPop from '@paystack/inline-js';
import { PayPalButtons, usePayPalScriptReducer, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useCart } from '../components/context/CartContext';

const OrderScreen = () => {
    const { id: orderId } = useParams();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState(''); // Track selection
    
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const fetchOrder = useCallback(async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(`/api/orders/${orderId}`, config);
            setOrder(data);
            setLoading(false);
        } catch (err) {
            swal("Error", "Could not fetch order details", "error");
        }
    }, [orderId, userInfo.token]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    const processSuccess = () => {
        clearCart();
        localStorage.removeItem('cartItems');
        navigate('/success');
    };

    // --- Unified Payment Handler ---
    // const handlePayment = () => {
    //     if (!paymentMethod) return swal("Wait!", "Please select a payment method", "info");

    //     if (paymentMethod === 'COD') {
    //         updateOrderOnServer({ payment_mode: 'COD' });
    //     } else if (paymentMethod === 'Paystack') {
    //         const handler = PaystackPop.setup({
    //             key: 'pk_test_YOUR_KEY_HERE',
    //             email: userInfo.email,
    //             amount: Math.round(order.totalPrice * 1500 * 100),
    //             currency: 'NGN',
    //             callback: (res) => updateOrderOnServer({ reference: res.reference, payment_mode: 'Paystack' }),
    //         });
    //         handler.openIframe();
    //     } else if (paymentMethod === 'PayPal') {
    //         const modal = new window.bootstrap.Modal(document.getElementById('paypalModal'));
    //         modal.show();
    //     }
    // };

    // import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";

// Create a small wrapper component
const PayPalButtonWrapper = ({ currency, showSpinner, amount, onSuccess }) => {
        // Define the onApprove function for PayPal
        const onApprove = (details) => {
            // You can customize this logic as needed
            updateOrderOnServer({
                payment_mode: 'PayPal',
                details
            });
        };
    const [{ isPending }] = usePayPalScriptReducer();

    return (
        <>
            {showSpinner && isPending && <div className="spinner-border text-primary" />}
            <PayPalButtons
                style={{ layout: "vertical" }}
                disabled={false}
                forceReRender={[amount, currency]}
                fundingSource={undefined}
                createOrder={(data, actions) => {
                    return actions.order.create({
                        purchase_units: [{ amount: { value: amount } }],
                    });
                }}
                onApprove={(data, actions) => {
                    return actions.order.capture().then((details) => {
                        onApprove(details);
                    });
                }}
            />
        </>
    );
};



    const updateOrderOnServer = async (paymentData) => {
        try {
            await axios.put(`/api/orders/${orderId}/pay`, paymentData, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            swal("Success", "Payment Successful!", "success");
            processSuccess();
        } catch (err) {
            swal("Error", "Failed to update order status", "error");
        }
    };

    // 2. This function ONLY updates the state when a radio is clicked
    const selectPaymentHandler = (method) => {
        setPaymentMethod(method);
    };

    // 3. This function handles the actual logic when the big button is clicked
    const handlePaymentAction = (e) => {
        e.preventDefault();
        
        if (!paymentMethod) {
            swal("Selection Required", "Please select a payment method to continue", "info");
            return;
        }

        if (paymentMethod === 'Paystack') {
            // Run your PaystackPop logic here
        } else if (paymentMethod === 'PayPal') {
            // Show your PayPal Modal here
        } else if (paymentMethod === 'COD') {
            // Run your COD axios call here
        }
    };

    if (loading || !order) return <div className="text-center py-5">Loading...</div>;

    return (
        <Container className="py-5">
            {/* PayPal Modal */}
            <div className="modal fade" id="paypalModal" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
<div className="modal-body text-center">
    <PayPalScriptProvider options={{ "client-id": "YOUR_ID", components: "buttons" }}>
        <PayPalButtonWrapper 
            amount={order.totalPrice} 
            currency="USD" 
            showSpinner={false}
        />
    </PayPalScriptProvider>
</div>
                    </div>
                </div>
            </div>

            <Row>
                <Col md={8}>
                    <Card className="mb-4 border-0 shadow-sm">
                        <Card.Body>
                            <h5 className="fw-bold mb-3">Delivery Information</h5>
                            <p className="mb-1 text-muted"><strong>Recipient:</strong> {order.user.name}</p>
                            <p className="mb-1 text-muted"><strong>Address:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}</p>
                            <Badge bg={order.isDelivered ? "success" : "warning"}>
                                {order.isDelivered ? "Delivered" : "Pending Delivery"}
                            </Badge>
                        </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <h4 className="fw-bold mb-4">Select Payment Method</h4>
                            
                            {/* PAYSTACK OPTION */}
                            <div className={`form-check p-3 mb-2 border rounded ${paymentMethod === 'Paystack' ? 'bg-light border-primary' : ''}`}>
                                <input 
                                    className="form-check-input" 
                                    type="radio" 
                                    name="payment_mode" 
                                    id="paystack" 
                                    value="Paystack"
                                    checked={paymentMethod === 'Paystack'} // Controlled component
                                    onChange={(e) => selectPaymentHandler(e.target.value)} 
                                />
                                <label className="form-check-label ms-2 fw-bold" htmlFor="paystack">
                                    Pay with Paystack (NGN)
                                </label>
                            </div>

                            {/* PAYPAL OPTION */}
                            <div className={`form-check p-3 mb-2 border rounded ${paymentMethod === 'PayPal' ? 'bg-light border-primary' : ''}`}>
                                <input 
                                    className="form-check-input" 
                                    type="radio" 
                                    name="payment_mode" 
                                    id="paypal" 
                                    value="PayPal"
                                    checked={paymentMethod === 'PayPal'} // Controlled component
                                    onChange={(e) => selectPaymentHandler(e.target.value)} 
                                />
                                <label className="form-check-label ms-2 fw-bold" htmlFor="paypal">
                                    Pay with PayPal (USD)
                                </label>
                            </div>

                            {/* COD OPTION */}
                            <div className={`form-check p-3 mb-2 border rounded ${paymentMethod === 'COD' ? 'bg-light border-primary' : ''}`}>
                                <input 
                                    className="form-check-input" 
                                    type="radio" 
                                    name="payment_mode" 
                                    id="cod" 
                                    value="COD"
                                    checked={paymentMethod === 'COD'}
                                    onChange={(e) => selectPaymentHandler(e.target.value)} 
                                />
                                <label className="form-check-label ms-2 fw-bold" htmlFor="cod">
                                    Cash on Delivery
                                </label>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="border-0 shadow-sm bg-dark text-white p-3">
                        <h4 className="fw-bold mb-4">Summary</h4>
                        <div className="d-flex justify-content-between mb-2">
                            <span>Subtotal</span>
                            <span>${order.totalPrice}</span>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between mb-4">
                            <span className="h5">Total</span>
                            <span className="h5 text-info">${order.totalPrice}</span>
                        </div>
                        <Button 
                            variant="dark" 
                            className="w-100 py-3 fw-bold rounded-pill"
                            onClick={handlePaymentAction}
                            disabled={!paymentMethod} // Disable until they pick one
                        >
                            Proceed to {paymentMethod || 'Payment'}
                        </Button>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default OrderScreen;