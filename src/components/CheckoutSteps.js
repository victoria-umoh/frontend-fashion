import React from 'react';
import { Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const CheckoutSteps = ({ step1, step2, step4 }) => {
  const steps = [
    { name: 'Sign In', link: '/login', active: step1 },
    { name: 'Shipping', link: '/shipping', active: step2 },
    // { name: 'Payment', link: '/payment', active: step3 },
    { name: 'Place Order', link: '/placeorder', active: step4 },
  ];

  return (
    <Nav className='justify-content-center mb-4 fw-bold text-uppercase small'>
      {steps.map((s, index) => (
        <Nav.Item key={index}>
          {s.active ? (
            <LinkContainer to={s.link}>
              <Nav.Link className="text-primary">{s.name}</Nav.Link>
            </LinkContainer>
          ) : (
            <Nav.Link disabled className="text-muted">{s.name}</Nav.Link>
          )}
        </Nav.Item>
      ))}
    </Nav>
  );
};

export default CheckoutSteps;