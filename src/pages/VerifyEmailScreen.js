import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { requireSupabase } from '../supabase';

const VerifyEmailScreen = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const code = searchParams.get('code') || '';
  const tokenHash = searchParams.get('token_hash') || '';
  const verificationType = searchParams.get('type') || 'signup';
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [message, setMessage] = useState(location.state?.notice || '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const verificationStarted = useRef(false);

  useEffect(() => {
    const hasCallback = code || tokenHash || window.location.hash.includes('access_token');
    if (!hasCallback || verificationStarted.current) return;
    verificationStarted.current = true;
    setIsSubmitting(true);
    const verify = async () => {
      const client = requireSupabase();
      if (code) {
        const { data, error: sessionError } = await client.auth.getSession();
        if (sessionError) throw sessionError;
        if (!data.session) {
          const { error: codeError } = await client.auth.exchangeCodeForSession(code);
          if (codeError) throw codeError;
        }
      } else if (tokenHash) {
        const { error: verificationError } = await client.auth.verifyOtp({
          token_hash: tokenHash,
          type: verificationType,
        });
        if (verificationError) throw verificationError;
      } else {
        const { data, error: sessionError } = await client.auth.getSession();
        if (sessionError) throw sessionError;
        if (!data.session) throw new Error('Unable to verify this email link.');
      }
      setMessage('Your email has been verified. You can now sign in.');
    };
    verify().catch((requestError) => setError(requestError.message || 'Unable to verify this email.'))
      .finally(() => setIsSubmitting(false));
  }, [code, tokenHash, verificationType]);

  const resendHandler = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setIsSubmitting(true);
    try {
      const { error: resendError } = await requireSupabase().auth.resend({
        type: 'signup',
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/verify-email` },
      });
      if (resendError) throw resendError;
      setMessage('If the address can be verified, a new verification email will be sent.');
    } catch (requestError) {
      setError(requestError.message || 'Unable to send a verification email.');
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
              {code || tokenHash ? (
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
