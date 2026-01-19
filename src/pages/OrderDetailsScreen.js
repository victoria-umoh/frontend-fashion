import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, ListGroup, Image, Card, Badge } from 'react-bootstrap';
import API from '../api';

const OrderDetailsScreen = () => {
    const { id: orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await API.get(`/api/orders/${orderId}`, config);
                setOrder(data);
            } catch (err) {
                console.error("Failed to fetch order", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId, userInfo.token]);

    if (loading) return <div className="text-center py-5">Loading Receipt...</div>;
    if (!order) return <div className="text-center py-5">Order not found.</div>;

    return (
        <Container className="py-5">
            <h2 className="fw-bold mb-4">Order <span className="text-muted fs-4">#{order._id}</span></h2>
            <Row>
                <Col md={8}>
                    <ListGroup variant="flush">
                        {/* Shipping Info */}
                        <Card className="border-0 shadow-sm mb-4 rounded-4">
                            <Card.Body>
                                <h5 className="fw-bold mb-3 text-primary">Shipping Details</h5>
                                <p className="mb-1"><strong>Name:</strong> {order.user.name}</p>
                                <p className="mb-1"><strong>Email:</strong> {order.user.email}</p>
                                <p className="mb-3"><strong>Address:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}</p>
                                {order.isDelivered && order.deliveredAt ? (
    <Badge bg="success">Delivered on {order.deliveredAt.substring(0, 10)}</Badge>
) : (
    <Badge bg="warning">Not Delivered</Badge>
)}
                            </Card.Body>
                        </Card>

                        {/* Payment Info */}
                        <Card className="border-0 shadow-sm mb-4 rounded-4">
                            <Card.Body>
                                <h5 className="fw-bold mb-3 text-primary">Payment Method</h5>
                                <p className="mb-3"><strong>Method:</strong> {order.paymentMethod}</p>
                               {/* Payment Section */}
{order.isPaid && order.paidAt ? (
    <Badge bg="success" className="px-3 py-2 rounded-pill">
        Paid on {order.paidAt.substring(0, 10)}
    </Badge>
) : (
    <Badge bg="danger" className="px-3 py-2 rounded-pill">
        Not Paid
    </Badge>
)}
                            </Card.Body>
                        </Card>

                        {/* Items List */}
                        <Card className="border-0 shadow-sm rounded-4">
                            <Card.Body>
                                <h5 className="fw-bold mb-4 text-primary">Order Items</h5>
                                {order.orderItems.map((item, index) => (
                                    <Row key={index} className="align-items-center mb-3 border-bottom pb-2">
                                        <Col xs={2}><Image src={item.image} alt={item.name} fluid rounded /></Col>
                                        <Col>
                                            <div className="fw-bold">{item.name}</div>
                                            {item.size && <Badge bg="light" text="dark" className="border">Size: {item.size}</Badge>}
                                        </Col>
                                        <Col xs={5} className="text-end">
                                            {item.qty} x ${item.price.toFixed(2)} = <strong>${(item.qty * item.price).toFixed(2)}</strong>
                                        </Col>
                                    </Row>
                                ))}
                            </Card.Body>
                        </Card>
                    </ListGroup>
                </Col>

                {/* Summary Sidebar */}
                <Col md={4}>
                    <Card className="border-0 shadow-sm p-4 bg-dark text-white rounded-4 sticky-top" style={{ top: '20px' }}>
                        <h4 className="fw-bold mb-4 border-bottom pb-2">Summary</h4>
                        <div className="d-flex justify-content-between mb-2">
                            <span>Subtotal</span><span>${order.itemsPrice.toFixed(2)}</span>
                        </div>

                        {/* NEW: Show Coupon Deduction if it exists */}
                        {order.discountPrice > 0 && (
                            <div className="d-flex justify-content-between mb-2 text-success fw-bold">
                                <span>Discount {order.appliedCoupon && `(${order.appliedCoupon})`}</span>
                                <span>-${order.discountPrice.toFixed(2)}</span>
                            </div>
                        )}

                        <div className="d-flex justify-content-between mb-2">
                            <span>Shipping</span><span>${order.shippingPrice.toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span>Tax</span><span>${order.taxPrice.toFixed(2)}</span>
                        </div>
                        <hr className="bg-light" />
                        <div className="d-flex justify-content-between mb-0 h4 fw-bold">
                            <span>Total</span>
                            <span className="text-info">${order.totalPrice.toFixed(2)}</span>
                        </div>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default OrderDetailsScreen;