import React, { useState, useEffect } from 'react';
import API from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Container, Card, Alert } from 'react-bootstrap';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      navigate('/');
    }
  }, [navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
    } else {
      setMessage(null);
      setError(null);
      try {
        const config = { headers: { 'Content-Type': 'application/json' } };
        const { data } = await API.post('/api/auth/register', { name, email, password }, config);
        if (data.token) {
          localStorage.setItem('userInfo', JSON.stringify(data));
          navigate('/');
        } else {
          navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        if (err.response?.status === 503) {
          navigate(`/verify-email?email=${encodeURIComponent(email)}`, { state: { notice: errorMessage } });
        } else {
          setError(errorMessage);
        }
      }
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center mt-5">
        <Col xs={12} md={6}>
          <Card className="auth-card p-4">
            <Card.Body>
              <h1 className="text-center mb-4">Sign Up</h1>
              
              {message && <Alert variant="danger">{message}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}
              {error && <div className="mb-3"><Link to={`/verify-email?email=${encodeURIComponent(email)}`}>Resend verification email</Link></div>}

              <Form onSubmit={submitHandler}>
                <Form.Group className="mb-3" controlId="name">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="confirmPassword">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button type="submit" variant="dark" className="w-100 py-2 mt-3">
                  Register
                </Button>
              </Form>

              <Row className="py-3">
                <Col className="text-center">
                  Have an account? <Link to="/login" className="text-decoration-none fw-bold">Login</Link>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterScreen;