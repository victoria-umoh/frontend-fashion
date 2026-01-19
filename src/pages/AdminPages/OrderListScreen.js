import React, { useEffect, useState } from 'react';
import { Table, Button, Container, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // Added for navigation
import API from '../../api';
import { toast } from 'react-toastify';

const OrderListScreen = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const config = { 
                    headers: { Authorization: `Bearer ${userInfo.token}` } 
                };
                const { data } = await API.get('/api/admin/orders', config);
                setOrders(data);
            } catch (err) {
                toast.error('Failed to load orders');
            } finally {
                setLoading(false);
            }
        };

        if (userInfo && userInfo.role === "admin") {
            fetchOrders();
        } else {
            navigate('/login');
        }
    }, [userInfo, navigate]);

    const deliverHandler = async (orderId) => {
        if (window.confirm('Are you sure you want to mark this order as delivered?')) {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                };
                await API.put(`/api/admin/orders/${orderId}/deliver`, {}, config);
                toast.success('Order status updated!');
                
                // Update local state so UI reflects change immediately
                setOrders(orders.map(o => o._id === orderId ? { ...o, isDelivered: true, deliveredAt: new Date().toISOString() } : o));
            } catch (err) {
                toast.error(err.response?.data.message || 'Error updating status');
            }
        }
    };

    const payHandler = async (orderId) => {
    if (window.confirm('Confirm that payment has been received for this order?')) {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                };
                // Note: You will need to create this backend route
                await API.put(`/api/admin/orders/${orderId}/pay`, {}, config);
                toast.success('Order marked as Paid');
                
                // Update local state
                setOrders(orders.map(o => o._id === orderId ? { ...o, isPaid: true, paidAt: new Date().toISOString() } : o));
            } catch (err) {
                toast.error(err.response?.data.message || 'Error updating payment status');
            }
        }
    };

    if (loading) return (
        <Container className="py-5 text-center">
            <Spinner animation="border" variant="dark" />
            <p className="mt-2">Fetching All Orders...</p>
        </Container>
    );

    return (
        <Container className="py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold m-0">Admin Dashboard: Orders</h2>
                <Badge bg="dark" className="p-2">{orders.length} Total Orders</Badge>
            </div>

            <div className="table-responsive shadow-sm rounded-4 overflow-hidden">
                <Table hover className="align-middle mb-0">
                    <thead className="bg-dark text-white text-uppercase small">
                        <tr>
                            <th className="py-3 px-3">ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Payment</th>
                            <th>Status</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {orders.map((order) => (
                            <tr key={order._id}>
                                <td className="px-3 text-muted small">#{order._id.substring(order._id.length - 8)}</td>
                                <td className="fw-bold">
                                    {order.user ? order.user.name : <span className="text-danger small italic text-uppercase">Deleted User</span>}
                                </td>
                                <td>{order.createdAt?.substring(0, 10)}</td>
                                <td className="fw-bold">${order.totalPrice.toFixed(2)}</td>
                                <td>
                                    {order.isPaid ? (
                                        <Badge bg="success-subtle" className="text-success border border-success px-2 py-1 rounded-pill">
                                            Paid ({order.paidAt?.substring(0, 10)})
                                        </Badge>
                                    ) : (
                                        <Badge bg="danger-subtle" className="text-danger border border-danger px-2 py-1 rounded-pill">
                                            Not Paid
                                        </Badge>
                                    )}
                                </td>
                                <td>
                                    {order.isDelivered ? (
                                        <Badge bg="info-subtle" className="text-info border border-info px-2 py-1 rounded-pill">
                                            Delivered ({order.deliveredAt?.substring(0, 10)})
                                        </Badge>
                                    ) : (
                                        <Badge bg="warning-subtle" className="text-warning border border-warning px-2 py-1 rounded-pill">
                                            In Progress
                                        </Badge>
                                    )}
                                </td>
                                <td className="text-center">
                                    <div className="d-flex gap-2 justify-content-center">
                                        <Button 
                                            variant="outline-secondary" 
                                            size="sm" 
                                            className="rounded-pill px-3 fw-bold"
                                            onClick={() => navigate(`/order/${order._id}`)}
                                        >
                                            View
                                        </Button>
                                        {/* Show "Pay" button only if NOT paid */}
                                        {!order.isPaid && (
                                            <Button 
                                                variant="success" 
                                                size="sm" 
                                                className="rounded-pill px-3 fw-bold"
                                                onClick={() => payHandler(order._id)}
                                            >
                                                Mark Paid
                                            </Button>
                                        )}
                                        {/* Show "Deliver" button only if NOT delivered */}
                                        {!order.isDelivered && (
                                            <Button 
                                                variant="dark" 
                                                size="sm" 
                                                className="rounded-pill px-3 fw-bold"
                                                onClick={() => deliverHandler(order._id)}
                                            >
                                                Deliver
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </Container>
    );
};

export default OrderListScreen;