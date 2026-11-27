import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, ListGroup, Image, Card, Badge } from 'react-bootstrap';
import API, { getImageUrl } from '../api';
import formatCurrency from '../utils/formatCurrency';

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
                                        <Col xs={2}><Image src={getImageUrl(item.image)} alt={item.name} fluid rounded /></Col>
                                        <Col>
                                            <div className="fw-bold">{item.name}</div>
                                            {item.size && <Badge bg="light" text="dark" className="border">Size: {item.size}</Badge>}
                                            {item.color && <Badge bg="light" text="dark" className="border ms-2">Colour: {item.color}</Badge>}
                                        </Col>
                                        <Col xs={5} className="text-end">
                                            {item.qty} × {formatCurrency(item.price)} = <strong>{formatCurrency(item.qty * item.price)}</strong>
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
                            <span>Subtotal</span><span>{formatCurrency(order.itemsPrice)}</span>
                        </div>

                        {/* NEW: Show Coupon Deduction if it exists */}
                        {order.discountAmount > 0 && (
                            <div className="d-flex justify-content-between mb-2 text-success fw-bold">
                                <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                                <span>-{formatCurrency(order.discountAmount)}</span>
                            </div>
                        )}

                        <div className="d-flex justify-content-between mb-2">
                            <span>Shipping</span><span>{formatCurrency(order.shippingPrice)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span>Tax</span><span>{formatCurrency(order.taxPrice)}</span>
                        </div>
                        <hr className="bg-light" />
                        <div className="d-flex justify-content-between mb-0 h4 fw-bold">
                            <span>Total</span>
                            <span className="text-info">{formatCurrency(order.totalPrice)}</span>
                        </div>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default OrderDetailsScreen;