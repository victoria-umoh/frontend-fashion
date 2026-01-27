import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';

const NotFoundScreen = () => (
  <Container className="text-center py-5">
    <Row className="justify-content-center">
      <Col md={8}>
        <h1 className="display-1 fw-bold text-danger mb-4">404</h1>
        <h2 className="mb-3">Page Not Found</h2>
        <p className="text-muted mb-4">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <Button as={Link} to="/" variant="dark" size="lg">
          Go to Homepage
        </Button>
      </Col>
    </Row>
  </Container>
);

export default NotFoundScreen;
