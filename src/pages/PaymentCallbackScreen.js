import React, { useEffect, useState } from 'react';
import { Alert, Button, Container, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import API from '../api';
import { useCart } from '../components/context/CartContext';

const readUserInfo = () => {
  try {
    return JSON.parse(localStorage.getItem('userInfo') || 'null');
  } catch {
    return null;
  }
};

const PaymentCallbackScreen = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const userInfo = readUserInfo();
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const orderId = searchParams.get('orderId');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!userInfo?.token || !reference) {
      setError(!userInfo?.token
        ? 'Log in with the account used to start this payment, then check your orders.'
        : 'The payment provider did not return a reference.');
      return () => {
        active = false;
      };
    }

    const verifyPayment = async () => {
      for (let attempt = 0; attempt < 10 && active; attempt += 1) {
        try {
          return await API.get(`/api/payments/verify/${encodeURIComponent(reference)}`, {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          });
        } catch (requestError) {
          const isProcessing = requestError.response?.status === 409
            && requestError.response?.data?.message?.includes('already in progress');
          if (!isProcessing || attempt === 9) throw requestError;
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      }
      return null;
    };

    verifyPayment().then((response) => {
      if (!active || !response) return;
      if (orderId && response.data._id !== orderId) {
        throw new Error('The verified payment does not match this order.');
      }
      clearCart();
      navigate('/success', { replace: true, state: { orderId: response.data._id, paymentMethod: 'Paystack' } });
    }).catch((requestError) => {
      if (active) {
        setError(requestError.response?.data?.message || requestError.message || 'Unable to verify this payment.');
      }
    });
    return () => {
      active = false;
    };
  }, [clearCart, navigate, orderId, reference, userInfo?.token]);

  return (
    <Container className="py-5 text-center">
      {error ? (
        <>
          <Alert variant="danger">{error}</Alert>
          <Button as={Link} to="/myorders" variant="dark">View my orders</Button>
        </>
      ) : (
        <>
          <Spinner animation="border" role="status" className="mb-3" />
          <h1 className="h4">Verifying your payment…</h1>
          <p className="text-muted">Please keep this page open while we confirm the transaction.</p>
        </>
      )}
    </Container>
  );
};

export default PaymentCallbackScreen;
