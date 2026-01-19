import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import { useCart } from '../components/context/CartContext';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';


const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const { loadCart } = useCart();

  // Check if user is already logged in
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      navigate('/'); // Redirect to home if already logged in
    }
  }, [navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await API.post('/api/auth/login', { email, password }, config);
      // const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password }, config);
      
      // Save user info (including JWT token) to localStorage
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      // Load user's saved cart
      const savedCart = localStorage.getItem('cart_' + data.id);
      if (savedCart) {
        loadCart(JSON.parse(savedCart));
      }
      
      navigate('/'); // Redirect to home
    } catch (err) {
      setError(err.response && err.response.data.message ? err.response.data.message : err.message);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <h2 className="text-center fw-bold mb-4">Sign In</h2>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={submitHandler}>
                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    id="login-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black outline-none transition"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="dark"
                  className="w-100 py-2 fw-bold"
                >
                  Login
                </Button>
              </Form>

              <div className="text-center mt-4">
                New Customer?{' '}
                <Link to="/register" className="fw-bold text-decoration-none">
                  Register
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginScreen;