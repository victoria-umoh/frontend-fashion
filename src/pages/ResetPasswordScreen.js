import React, { useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../api';

const ResetPasswordScreen = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitHandler = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await API.post('/api/auth/reset-password', { email, token, password });
      setMessage(data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to reset your password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="auth-card">
            <Card.Body className="p-4">
              <h1 className="h3 text-center fw-bold mb-4">Choose a new password</h1>
              {message && <Alert variant="success">{message} <Link to="/login">Sign in</Link></Alert>}
              {error && <Alert variant="danger">{error}</Alert>}
              {!message && (!email || !token ? (
                <Alert variant="warning">This reset link is incomplete or invalid.</Alert>
              ) : (
                <Form onSubmit={submitHandler}>
                  <Form.Group className="mb-3" controlId="reset-password">
                    <Form.Label>New password</Form.Label>
                    <Form.Control
                      type="password"
                      minLength={6}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="reset-password-confirm">
                    <Form.Label>Confirm password</Form.Label>
                    <Form.Control
                      type="password"
                      minLength={6}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      required
                    />
                  </Form.Group>
                  <Button type="submit" variant="dark" className="w-100" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving…' : 'Update password'}
                  </Button>
                </Form>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPasswordScreen;
