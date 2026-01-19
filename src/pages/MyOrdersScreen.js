import React, { useEffect, useState } from 'react';
import { Table, Button, Row, Col, Container, Badge, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';

const MyOrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      const fetchMyOrders = async () => {
        try {
          const config = {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          };
          const { data } = await API.get('/api/orders/myorders', config);
          setOrders(data);
        } catch (error) {
          console.error("Error fetching orders:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchMyOrders();
    }
  }, [userInfo, navigate]);

  return (
    <Container className="py-5">
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="fw-bold uppercase tracking-widest m-0">Order History</h2>
          <p className="text-muted small">Manage and track your recent purchases</p>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="dark" />
          <p className="mt-2">Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-5 shadow-sm rounded-4 bg-light">
          <h4 className="text-muted">No orders found</h4>
          <p>It looks like you haven't placed any orders yet.</p>
          <Button as={Link} to="/" variant="dark" className="rounded-pill px-4">
            Start Shopping
          </Button>
        </div>
      ) : (
        <div className="table-responsive shadow-sm rounded-4 overflow-hidden">
          <Table hover className="align-middle mb-0 bg-white">
            <thead className="bg-dark text-white">
              <tr>
                <th className="py-3 px-3">ORDER ID</th>
                <th>DATE</th>
                <th>ITEMS</th>
                <th>TOTAL</th>
                <th>PAYMENT</th>
                <th>DELIVERY</th>
                <th className="text-center">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="px-3 fw-bold text-muted">
                    #{order._id.substring(order._id.length - 8).toUpperCase()}
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      {order.orderItems.length > 0 && (
                        <img 
                          src={order.orderItems[0].image} 
                          alt="product" 
                          className="rounded me-2"
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
                        />
                      )}
                      <span className="small">
                        {order.orderItems.length} {order.orderItems.length === 1 ? 'Item' : 'Items'}
                      </span>
                    </div>
                  </td>
                  <td className="fw-bold">${order.totalPrice.toFixed(2)}</td>
                  <td>
                    {order.isPaid ? (
                      <Badge bg="success-subtle" className="text-success border border-success px-2 py-1 rounded-pill">
                        Paid
                      </Badge>
                    ) : (
                      <Badge bg="danger-subtle" className="text-danger border border-danger px-2 py-1 rounded-pill">
                        Pending
                      </Badge>
                    )}
                  </td>
                  <td>
                    {order.isDelivered ? (
                      <Badge bg="info-subtle" className="text-info border border-info px-2 py-1 rounded-pill">
                        Shipped
                      </Badge>
                    ) : (
                      <Badge bg="secondary-subtle" className="text-secondary border border-secondary px-2 py-1 rounded-pill">
                        Processing
                      </Badge>
                    )}
                  </td>
                  <td className="text-center">
                    <Button 
                      variant="outline-dark" 
                      size="sm" 
                      className="rounded-pill px-3 fw-bold shadow-sm"
                      onClick={() => navigate(`/order/${order._id}`)}
                    >
                      VIEW
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default MyOrdersScreen;