import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import API from '../api';

const VerifyEmailScreen = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const token = searchParams.get('token') || '';
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [message, setMessage] = useState(location.state?.notice || '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const verificationStarted = useRef(false);

  useEffect(() => {
    if (!token || verificationStarted.current) return;
    verificationStarted.current = true;
    setIsSubmitting(true);
    API.post('/api/auth/verify-email', { email, token })
      .then(({ data }) => setMessage(data.message))
      .catch((requestError) => {
        setError(requestError.response?.data?.message || 'Unable to verify this email.');
      })
      .finally(() => setIsSubmitting(false));
  }, [email, token]);

  const resendHandler = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setIsSubmitting(true);
    try {
      const { data } = await API.post('/api/auth/resend-verification', { email });
      setMessage(data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to send a verification email.');
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
              <h1 className="h3 text-center fw-bold mb-4">Verify your email</h1>
              {message && <Alert variant={location.state?.notice ? 'warning' : 'success'}>{message}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}
              {token ? (
                isSubmitting && <p className="text-center">Verifying your email…</p>
              ) : (
                <>
                  {!message && <p>Check your inbox for a verification link, or request a new one below.</p>}
                  <Form onSubmit={resendHandler}>
                    <Form.Group className="mb-3" controlId="verification-email">
                      <Form.Label>Email address</Form.Label>
                      <Form.Control
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                      />
                    </Form.Group>
                    <Button type="submit" variant="dark" className="w-100" disabled={isSubmitting}>
                      {isSubmitting ? 'Sending…' : 'Resend verification email'}
                    </Button>
                  </Form>
                </>
              )}
              <div className="text-center mt-3"><Link to="/login">Back to sign in</Link></div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default VerifyEmailScreen;
