import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Container, Table, Badge, Button } from 'react-bootstrap';
import { CashStack, People, CartCheck, BoxSeam, ArrowRight } from 'react-bootstrap-icons';
import { LinkContainer } from 'react-router-bootstrap';
import API from '../../api';

const DashboardScreen = () => {
    // 1. Single state for all dashboard data
    const [dashboardData, setDashboardData] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalProducts: 0,
        totalReviews: 0,
        recentOrders: [],
        lowStockProducts: []
    });
    const [loading, setLoading] = useState(true);

    // 2. Optimized fetching logic
    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                if (!userInfo) return;

                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                
                // Fetching from your stats endpoint (make sure backend returns recentOrders/lowStock)
                const { data } = await API.get('/api/admin/stats', config);
                                // If backend does not provide totalReviews, calculate it here as a fallback
                                if (typeof data.totalReviews === 'undefined' && Array.isArray(data.products)) {
                                    data.totalReviews = data.products.reduce((acc, p) => acc + (Array.isArray(p.reviews) ? p.reviews.length : 0), 0);
                                }
                                setDashboardData(data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, []);

    // 3. UI Card Configuration
    const cardItems = [
        { title: 'Revenue', val: `₦${dashboardData.totalRevenue}`, icon: <CashStack />, bg: 'bg-success-light', color: 'text-success' },
        { title: 'Orders', val: dashboardData.totalOrders, icon: <CartCheck />, bg: 'bg-primary-light', color: 'text-primary' },
        { title: 'Users', val: dashboardData.totalUsers, icon: <People />, bg: 'bg-info-light', color: 'text-info' },
        { title: 'Products', val: dashboardData.totalProducts, icon: <BoxSeam />, bg: 'bg-warning-light', color: 'text-warning' },
        { title: 'Reviews', val: dashboardData.totalReviews, icon: <span role="img" aria-label="star">⭐</span>, bg: 'bg-secondary-light', color: 'text-secondary' }
    ];
            <style>{`
                .bg-success-light { background-color: #e8f5e9; }
                .bg-primary-light { background-color: #e3f2fd; }
                .bg-info-light { background-color: #e0f7fa; }
                .bg-warning-light { background-color: #fff8e1; }
                .bg-secondary-light { background-color: #f3f3f3; }
                .bg-success-soft { background-color: rgba(25, 135, 84, 0.1); }
                .bg-danger-soft { background-color: rgba(220, 53, 69, 0.1); }
                .x-small { font-size: 0.75rem; }
                .btn-xs { padding: 0.25rem 0.4rem; }
            `}</style>

    if (loading) return <Container className="py-5"><h4>Loading Analytics...</h4></Container>;

    return (
        <Container className="py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">Business Dashboard</h2>
                <Badge bg="dark" className="px-3 py-2">Admin View</Badge>
            </div>

            {/* Stats Cards Section */}
            <Row className="mb-5">
                {cardItems.map((card, idx) => (
                    <Col key={idx} md={3} sm={6} className="mb-3">
                        <Card className="border-0 shadow-sm rounded-4 h-100">
                            <Card.Body className="d-flex align-items-center p-4">
                                <div className={`p-2 rounded-circle me-1 ${card.bg} ${card.color} d-flex align-items-center justify-content-center`}>
                                    {React.cloneElement(card.icon, { size: 20 })}
                                </div>
                                <div>
                                    <p className="text-muted small mb-0 fw-bold text-uppercase">{card.title}</p>
                                    <h4 className="fw-bold mb-0">{card.val}</h4>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row>
                {/* Recent Orders Table */}
                <Col lg={8} className="mb-4">
                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden h-100">
                        <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center border-0">
                            <h5 className="mb-0 fw-bold">Recent Orders</h5>
                            <LinkContainer to="/admin/orderlist">
                                <Button variant="link" className="text-decoration-none text-primary fw-bold p-0 small">
                                    View All <ArrowRight size={14} />
                                </Button>
                            </LinkContainer>
                        </Card.Header>
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4">CUSTOMER</th>
                                    <th>DATE</th>
                                    <th>TOTAL</th>
                                    <th>STATUS</th>
                                    <th className="pe-4 text-end">ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboardData.recentOrders.map((order) => (
                                    <tr key={order._id}>
                                        <td className="ps-4">
                                            <div className="fw-bold text-dark">{order.user?.name || 'Guest'}</div>
                                            <div className="text-muted x-small">ID: {order._id.substring(18)}</div>
                                        </td>
                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="fw-bold">₦{order.totalPrice.toFixed(2)}</td>
                                        <td>
                                            <Badge bg={order.isPaid ? 'success-soft' : 'danger-soft'} 
                                                   className={`${order.isPaid ? 'text-success' : 'text-danger'} rounded-pill px-3`}>
                                                {order.isPaid ? 'Paid' : 'Unpaid'}
                                            </Badge>
                                        </td>
                                        <td className="pe-4 text-end">
                                            <LinkContainer to={`/order/${order._id}`}>
                                                <Button variant="light" size="sm" className="rounded-pill border shadow-sm">Details</Button>
                                            </LinkContainer>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card>
                </Col>

                {/* Low Stock Alerts */}
                <Col lg={4} className="mb-4">
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                        <Card.Header className="bg-white py-3 border-0">
                            <h5 className="mb-0 fw-bold text-danger">Inventory Alerts</h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table hover responsive className="mb-0 align-middle">
                                <tbody>
                                    {dashboardData.lowStockProducts.length > 0 ? (
                                        dashboardData.lowStockProducts.map((product) => (
                                            <tr key={product._id}>
                                                <td className="ps-4">
                                                    <div className="fw-bold small">{product.name}</div>
                                                    <Badge bg={product.countInStock === 0 ? 'danger' : 'warning'} className="x-small">
                                                        {product.countInStock === 0 ? 'Out of Stock' : `${product.countInStock} Left`}
                                                    </Badge>
                                                </td>
                                                <td className="pe-4 text-end">
                                                    <LinkContainer to={`/admin/product/${product._id}/edit`}>
                                                        <Button variant="outline-dark" size="sm" className="btn-xs rounded-circle">
                                                            <ArrowRight size={12} />
                                                        </Button>
                                                    </LinkContainer>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td className="text-center py-4 text-muted">Stock levels healthy ✅</td></tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <style>{`
                .bg-success-light { background-color: #e8f5e9; }
                .bg-primary-light { background-color: #e3f2fd; }
                .bg-info-light { background-color: #e0f7fa; }
                .bg-warning-light { background-color: #fff8e1; }
                .bg-success-soft { background-color: rgba(25, 135, 84, 0.1); }
                .bg-danger-soft { background-color: rgba(220, 53, 69, 0.1); }
                .x-small { font-size: 0.75rem; }
                .btn-xs { padding: 0.25rem 0.4rem; }
            `}</style>
        </Container>
    );
};

export default DashboardScreen;