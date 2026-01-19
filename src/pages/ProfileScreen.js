import React, { useEffect, useState } from 'react';
import { Table, Button, Row, Col, Card, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import API from '../api';
import { PersonCircle, BagCheck, BoxSeam } from 'react-bootstrap-icons';

const ProfileScreen = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        const fetchMyOrders = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                };
                const { data } = await API.get('/api/orders/myorders', config);
                setOrders(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching orders", error);
                setLoading(false);
            }
        };

        fetchMyOrders();
    }, [userInfo]);

    return (
        <Container className="py-5">
            <Row>
                {/* User Info Sidebar */}
                <Col md={2}>
                    <Card className="border-0 shadow-sm text-center p-4 mb-4 rounded-4">
                        <PersonCircle size={60} className="text-secondary mb-3 mx-auto" />
                        <h5 className="fw-bold mb-1">{userInfo.name}</h5>
                        <p className="text-muted small mb-3">{userInfo.email}</p>
                        <Button variant="outline-dark" size="sm" className="rounded-pill w-100">
                            Edit Profile
                        </Button>
                    </Card>
                </Col>

                {/* Orders Main Section */}
                <Col md={10}>
                    <h3 className="fw-bold mb-4 d-flex align-items-center">
                        <BagCheck className="me-2" /> My Orders
                    </h3>

                    {loading ? (
                        <div className="text-center py-5">Loading your orders...</div>
                    ) : orders.length === 0 ? (
                        <Card className="text-center p-5 border-0 shadow-sm rounded-4">
                            <BoxSeam size={50} className="text-muted mb-3 mx-auto" />
                            <h4>No orders found</h4>
                            <p className="text-muted">Looks like you haven't bought anything yet.</p>
                            <LinkContainer to="/">
                                <Button variant="dark" className="rounded-pill px-4 mt-2">Start Shopping</Button>
                            </LinkContainer>
                        </Card>
                    ) : (
                        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                            <Table hover responsive className="mb-0 align-middle">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-4">ID</th>
                                        <th>DATE</th>
                                        <th>IMAGE</th>
                                        <th>QTY</th>
                                        <th>Size(s)</th>
                                        <th>Payment Mode</th>
                                        <th>TOTAL</th>
                                        <th>PAID</th>
                                        <th>DELIVERED</th>
                                        <th className="text-end pe-4">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                   {orders.map((order) => (
                                      <tr key={order._id}>
                                          <td className="ps-4 fw-mono small">{order._id?.substring(0, 10)}...</td>
                                          <td>{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</td>
                                          <td>
                                            {order.orderItems && order.orderItems.length > 0 && (
                                              <img 
                                                src={order.orderItems[0].image} 
                                                alt={order.orderItems[0].name || 'product'} 
                                                style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }} 
                                                onError={(e) => {e.target.src = '/fallback-image.png'}}
                                              />
                                            )}
                                          </td>
                                          <td>{order.orderItems ? order.orderItems.reduce((sum, item) => sum + item.qty, 0) : 0}</td>
                                          <td>{order.orderItems ? order.orderItems.map(item => item.size || '-').join(', ') : '-'}</td>
                                          <td>{order.paymentMethod || '-'}</td>
                                          <td className="fw-bold">${order.totalPrice}</td>
                                          <td>
                                              {order.isPaid ? (
                                                  <span className="text-success">{order.paidAt ? new Date(order.paidAt).toLocaleString() : 'Paid'}</span>
                                              ) : (
                                                  <span className="text-danger">Pending</span>
                                              )}
                                          </td>
                                          <td>
                                              {order.isDelivered ? (
                                                  <span className="text-success">{order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : 'Delivered'}</span>
                                              ) : (
                                                  <span className="text-danger">No</span>
                                              )}
                                          </td>
                                          <td className="text-end pe-4">
                                              <LinkContainer to={`/order/${order._id}`}>
                                                  <Button variant="light" size="sm" className="rounded-pill px-3">
                                                      Details
                                                  </Button>
                                              </LinkContainer>
                                          </td>
                                      </tr>
                                  ))}
                                </tbody>
                            </Table>
                        </Card>
                    )}
                </Col>
            </Row>

            <style>{`
                .bg-success-soft { background-color: rgba(25, 135, 84, 0.1); }
                .bg-danger-soft { background-color: rgba(220, 53, 69, 0.1); }
                .bg-warning-soft { background-color: rgba(255, 193, 7, 0.1); }
                .bg-info-soft { background-color: rgba(13, 202, 240, 0.1); }
                .fw-mono { font-family: monospace; }
                table thead th { font-size: 0.75rem; text-transform: uppercase; color: #6c757d; border-bottom: none; }
                table tbody td { border-top: 1px solid #f8f9fa; padding: 1.25rem 0.75rem; }
            `}</style>
        </Container>
    );
};

export default ProfileScreen;