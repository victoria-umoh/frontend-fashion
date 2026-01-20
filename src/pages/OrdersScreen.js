import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, ListGroup, Card, Container } from 'react-bootstrap';
import API from '../api';
import swal from 'sweetalert';
import PaystackPop from '@paystack/inline-js';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useCart } from '../components/context/CartContext'; 
// import DiscountCodeInput from './DiscountCodeInput'; // Ensure path is correct

const OrderScreen = () => {
    const { id: orderId } = useParams();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    // const [error, setError] = useState({});
    const [discount, setDiscount] = useState(0);
    
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get(`/api/orders/${orderId}`, config);
                setOrder(data);
                setLoading(false);
            } catch (err) {
                swal("Error", "Could not fetch order details", "error");
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId, userInfo.token]);

    // const handleDiscountApplied = (discountAmount) => {
    //     setDiscount(discountAmount);
    // };

    // --- PAYPAL LOGIC ---
    const createOrder = (data, actions) => {
        // Calculate final price minus discount
        const finalAmount = (order.totalPrice - discount).toFixed(2);
        return actions.order.create({
            purchase_units: [{
                amount: { value: finalAmount > 0 ? finalAmount : "0.01" } 
            }],
        });
    };

    const onApprove = (data, actions) => {
        return actions.order.capture().then((details) => {
            const payment_id = details.id;
            
            // Update order status in DB
            axios.put(`/api/orders/${orderId}/pay`, { 
                payment_id, 
                payment_mode: 'PayPal' 
            }, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            })
            .then(res => {
                swal("Success", "Payment Received via PayPal!", "success");
                processSuccess();
            })
            .catch(err => swal("Error", "Payment captured but failed to update server.", "error"));
        });
    };

    // --- PAYMENT GATEWAY ROUTER ---
    const submitOrder = (e, payment_mode) => {
        e.preventDefault();
        
        const finalPrice = order.totalPrice - discount;

        if (payment_mode === 'cod') {
            axios.put(`/api/orders/${orderId}/pay`, { payment_mode: 'COD' }, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            }).then(res => {
                swal("Success", "Order set to Cash on Delivery", "success");
                processSuccess();
            });
        } 
        else if (payment_mode === 'payWithPaystack') {
            const handler = new PaystackPop();
            handler.open({
                key: 'pk_test_06a68fcb115734baf1107749edcd6773bb881c1e',
                email: userInfo.email,
                amount: Math.round(finalPrice * 1500 * 100), // Naira conversion
                currency: 'NGN',
                callback: function(response) {
                    axios.put(`/api/orders/${orderId}/pay`, { 
                        reference: response.reference,
                        payment_mode: 'Paystack'
                    }, {
                        headers: { Authorization: `Bearer ${userInfo.token}` }
                    }).then(res => {
                        swal("Success", "Paid via Paystack!", "success");
                        processSuccess();
                    });
                },
                onClose: () => swal("Cancelled", "Window closed.", "info"),
            });
        }
        else if (payment_mode === 'payOnline') {
            // Show Bootstrap Modal for PayPal
            const payModal = new window.bootstrap.Modal(document.getElementById('payOnlineModal'));
            payModal.show();
        }
    };

    const processSuccess = () => {
        clearCart();
        localStorage.removeItem('cartItems');
        navigate('/success');
    };

    if (loading || !order) return <Container className="py-5"><h4>Loading Order...</h4></Container>;

    return (
        <Container className="py-5">
            {/* PayPal Modal */}
            <div className="modal fade" id="payOnlineModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Pay with PayPal</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body text-center">
                            <PayPalScriptProvider options={{ "client-id": "AZJsdYrfkArCaHFmCDj8ypef8QGEVr2K0PTXVaKIPKJ0tVpPe6nDMYYt_YogWXxqkNC21VZdB4WIvu-Y" }}>
                                <PayPalButtons createOrder={createOrder} onApprove={onApprove} />
                            </PayPalScriptProvider>
                        </div>
                    </div>
                </div>
            </div>

            <Row>
                <Col md={8}>
                    <Card className="mb-3 shadow-sm">
                        <Card.Body>
                            <h4 className="fw-bold">Shipping Details</h4>
                            <p><strong>Name:</strong> {order.user.name}</p>
                            <p><strong>Email:</strong> {order.user.email}</p>
                            <p><strong>Address:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}</p>
                        </Card.Body>
                    </Card>

                    <Card className="shadow-sm">
                        <Card.Body>
                            <h4 className="fw-bold mb-3">Select Payment Method</h4>
                            <div className="form-check mb-2">
                                <input className="form-check-input" type="radio" name="payment_mode" id="cod" onChange={(e) => submitOrder(e, 'cod')} />
                                <label className="form-check-label" htmlFor="cod">Cash on Delivery</label>
                            </div>
                            <div className="form-check mb-2">
                                <input className="form-check-input" type="radio" name="payment_mode" id="paystack" onChange={(e) => submitOrder(e, 'payWithPaystack')} />
                                <label className="form-check-label" htmlFor="paystack">Pay with Paystack (NGN)</label>
                            </div>
                            <div className="form-check mb-4">
                                <input className="form-check-input" type="radio" name="payment_mode" id="paypal" onChange={(e) => submitOrder(e, 'payOnline')} />
                                <label className="form-check-label" htmlFor="paypal">Pay with PayPal (USD)</label>
                            </div>
                            
                            <hr />
                            {/* <DiscountCodeInput onApply={handleDiscountApplied} /> */}
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="shadow-sm border-0 p-3">
                        <h4 className="fw-bold border-bottom pb-2">Order Summary</h4>
                        <ListGroup variant="flush">
                            <ListGroup.Item>
                                <Row>
                                    <Col>Subtotal</Col>
                                    <Col className="text-end">${order.totalPrice}</Col>
                                </Row>
                            </ListGroup.Item>
                            {discount > 0 && (
                                <ListGroup.Item>
                                    <Row className="text-success">
                                        <Col>Discount</Col>
                                        <Col className="text-end">-${discount}</Col>
                                    </Row>
                                </ListGroup.Item>
                            )}
                            <ListGroup.Item>
                                <Row>
                                    <Col className="fw-bold">Grand Total</Col>
                                    <Col className="text-end fw-bold text-primary">
                                        ${(order.totalPrice - discount).toFixed(2)}
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default OrderScreen;


// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { Card, Container, Button } from 'react-bootstrap';
// import axios from 'axios';
// import Swal from 'sweetalert2';
// import swal from 'sweetalert';
// import PaystackPop from '@paystack/inline-js';
// import { useCart } from '../components/context/CartContext'; 

// function OrdersScreen() {
//     const { id: orderId } = useParams();
//     const navigate = useNavigate();
//     const { clearCart } = useCart();
    
//     const [order, setOrder] = useState(null);
//     const [loading, setLoading] = useState(true);
    
//     const userInfo = JSON.parse(localStorage.getItem('userInfo'));

//     useEffect(() => {
//         const fetchOrder = async () => {
//             try {
//                 const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
//                 const { data } = await axios.get(`/api/orders/${orderId}`, config);
//                 setOrder(data);
//                 setLoading(false);
//             } catch (err) {
//                 Swal.fire("Error", "Could not fetch order details", "error");
//                 setLoading(false);
//             }
//         };
//         fetchOrder();
//     }, [orderId, userInfo.token]);

//     const handlePaystackPayment = (e) => {
//         e.preventDefault();

//         // Data object to send back to server after payment

//         // Initialize Paystack Inline (from your example)
//         const handler = PaystackPop.setup({
//             key: 'pk_test_06a68fcb115734baf1107749edcd6773bb881c1e', // Replace with your key
//             email: userInfo.email,
//             // Paystack expects amount in Kobo (Naira * 100)
//             amount: Math.round(order.totalPrice * 1500 * 100), 
//             currency: 'NGN',
//             callback: function(response) {
//                 // This runs after successful payment
//                 const reference = response.reference;
                
//                 // Update order in database to 'Paid'
//                 axios.put(`/api/orders/${orderId}/pay`, { reference }, {
//                     headers: { Authorization: `Bearer ${userInfo.token}` }
//                 })
//                 .then(res => {
//                     swal("Success", "Payment Received & Order Placed!", "success");
//                     clearCart();
//                     localStorage.removeItem('cartItems');
//                     navigate('/success');
//                 })
//                 .catch(err => {
//                     swal("Warning", "Payment successful, but failed to update order status.", "warning");
//                 });
//             },
//             onClose: function() {
//                 swal("Cancelled", "Transaction was not completed.", "info");
//             },
//         });

//         handler.openIframe();
//     };

//     if (loading) return <Container className="py-5"><h4>Loading Order...</h4></Container>;

//     return (
//         <Container className="py-5">
//             <div className="row">
//                 <div className="col-md-8">
//                     <Card className="shadow-sm border-0 mb-4">
//                         <Card.Header className="bg-white py-3">
//                             <h4 className="mb-0">Shipping Information</h4>
//                         </Card.Header>
//                         <Card.Body>
//                             <p><strong>Name:</strong> {order.shippingAddress.address}</p>
//                             <p><strong>Email:</strong> {userInfo.email}</p>
//                             <p><strong>Address:</strong> {order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
//                         </Card.Body>
//                     </Card>
//                 </div>

//                 <div className="col-md-4">
//                     <Card className="shadow-sm border-0">
//                         <Card.Header className="bg-white py-3">
//                             <h4 className="mb-0">Order Summary</h4>
//                         </Card.Header>
//                         <Card.Body>
//                             <div className="d-flex justify-content-between mb-2">
//                                 <span>Total (USD)</span>
//                                 <strong>${order.totalPrice}</strong>
//                             </div>
//                             <div className="d-flex justify-content-between mb-3 text-muted">
//                                 <span>Total (NGN)</span>
//                                 <span>₦{(order.totalPrice * 1500).toLocaleString()}</span>
//                             </div>
//                             <hr />
//                             {!order.isPaid ? (
//                                 <Button 
//                                     variant="dark" 
//                                     className="w-100 py-3 rounded-pill fw-bold"
//                                     onClick={handlePaystackPayment}
//                                 >
//                                     Pay with Paystack
//                                 </Button>
//                             ) : (
//                                 <div className="alert alert-success text-center fw-bold">
//                                     ORDER PAID
//                                 </div>
//                             )}
//                         </Card.Body>
//                     </Card>
//                 </div>
//             </div>
//         </Container>
//     );
// }

// export default OrdersScreen;