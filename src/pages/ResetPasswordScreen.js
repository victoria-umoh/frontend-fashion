import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { requireSupabase } from '../supabase';

const ResetPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let subscription;
    try {
      const client = requireSupabase();
      client.auth.getSession().then(({ data, error: sessionError }) => {
        if (sessionError) setError(sessionError.message);
        setHasRecoverySession(Boolean(data.session));
        setIsCheckingSession(false);
      }).catch((sessionError) => {
        setError(sessionError.message || 'Unable to validate the password reset link.');
        setIsCheckingSession(false);
      });
      subscription = client.auth.onAuthStateChange((_event, session) => {
        setHasRecoverySession(Boolean(session));
        setIsCheckingSession(false);
      }).data.subscription;
    } catch (sessionError) {
      setError(sessionError.message);
      setIsCheckingSession(false);
    }
    return () => subscription?.unsubscribe();
  }, []);

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
      const client = requireSupabase();
      const { data: sessionData, error: sessionError } = await client.auth.getSession();
      if (sessionError) throw sessionError;
      if (!sessionData.session) throw new Error('This password reset link is invalid or has expired.');
      const { error: updateError } = await client.auth.updateUser({ password });
      if (updateError) throw updateError;
      await client.auth.signOut();
      localStorage.removeItem('userInfo');
      setHasRecoverySession(false);
      setMessage('Your password has been updated. Sign in with your new password.');
    } catch (requestError) {
      setError(requestError.message || 'Unable to reset your password.');
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
              {!message && (isCheckingSession ? (
                <p className="text-center">Checking your reset link…</p>
              ) : !hasRecoverySession ? (
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
