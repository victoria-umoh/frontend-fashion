import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../components/context/CartContext';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { loadProfile } from '../auth';
import { requireSupabase } from '../supabase';


const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const { loadCart } = useCart();

  useEffect(() => {
    let active = true;
    const restoreSession = async () => {
      try {
        const { data, error: sessionError } = await requireSupabase().auth.getSession();
        if (sessionError) throw sessionError;
        if (!data.session) {
          localStorage.removeItem('userInfo');
          return;
        }
        const profile = await loadProfile(data.session);
        if (!active) return;
        localStorage.setItem('userInfo', JSON.stringify(profile));
        navigate('/');
      } catch (sessionError) {
        if (active) setError(sessionError.message || 'Unable to restore your session.');
      }
    };
    restoreSession();
    return () => {
      active = false;
    };
  }, [navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const { data, error: loginError } = await requireSupabase().auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (loginError) throw loginError;
      const profile = await loadProfile(data.session);
      if (profile.mustResetPassword) {
        const { error: resetError } = await requireSupabase().auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        await requireSupabase().auth.signOut();
        if (resetError) throw resetError;
        setError('Your account needs a new password. Check your email for a reset link.');
        return;
      }
      if (!profile.isVerified) {
        await requireSupabase().auth.signOut();
        setError('Verify your email before signing in. Use the link in your inbox or resend it below.');
        return;
      }

      localStorage.setItem('userInfo', JSON.stringify(profile));
      const savedCart = localStorage.getItem(`cart_${profile.legacyId || profile.id}`)
        || localStorage.getItem(`cart_${profile.id}`);
      if (savedCart) {
        loadCart(JSON.parse(savedCart));
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to sign in.');
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="auth-card">
            <Card.Body className="p-4">
              <h2 className="text-center fw-bold mb-4">Sign In</h2>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={submitHandler}>

                <Form.Group className="mb-3" controlId="login-email">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="login-password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <div className="text-end mb-3">
                  <Link to="/forgot-password" className="small">Forgot password?</Link>
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
              {error?.toLowerCase().includes('verify your email') && (
                <div className="text-center mt-2">
                  <Link to={`/verify-email?email=${encodeURIComponent(email)}`}>Resend verification email</Link>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginScreen;