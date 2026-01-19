// const SuccessScreen = () => {
//   return (
//     <Container className="text-center py-5">
//       <i className="fas fa-check-circle text-success fa-5x mb-4"></i>
//       <h1 className="fw-bold">Payment Successful!</h1>
//       <p className="lead">Thank you for shopping with Victoria Fashion. Your order is being processed.</p>
//       <Button variant="dark" onClick={() => navigate('/')} className="mt-3 px-5 py-3 rounded-pill">
//         Continue Shopping
//       </Button>
//     </Container>
//   );
// };

// import React, { useEffect } from 'react';
// import { Container, Button } from 'react-bootstrap';
// import { useNavigate } from 'react-router-dom';
// import Swal from 'sweetalert2';


// const SuccessScreen = () => {
//   const navigate = useNavigate();
//   useEffect(() => {
//     if (localStorage.getItem('justPaid') === 'true') {
//       Swal.fire({
//         title: 'Payment Successful!',
//         text: 'Your cart has been cleared. Thank you for your purchase!',
//         icon: 'success',
//         timer: 3000,
//         showConfirmButton: false
//       });
//       localStorage.removeItem('justPaid');
//     }
//   }, []);
//   return (
//     <Container className="text-center py-5">
//       <div className="mb-4">
//         <i className="fas fa-check-circle text-success" style={{ fontSize: '5rem' }}></i>
//       </div>
//       <h1 className="fw-bold">Order Confirmed!</h1>
//       <p className="lead mb-4">
//         Your payment was processed successfully. You will receive an email confirmation shortly.
//       </p>
//       <Button 
//         variant="dark" 
//         className="rounded-pill px-5 py-3" 
//         onClick={() => navigate('/myorders')}
//       >
//         View My Orders
//       </Button>
//     </Container>
//   );
// };

// export default SuccessScreen;

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import { CheckCircleFill, HouseFill, BagCheckFill, Clipboard } from 'react-bootstrap-icons';
import swal from 'sweetalert';

const SuccessScreen = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Grab the orderId from the state passed via navigate
    const orderId = location.state?.orderId;

    const [windowDimension, setWindowDimension] = useState({ 
        width: window.innerWidth, 
        height: window.innerHeight 
    });
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        // 1. Redirect if no orderId (prevent direct access to success page)
        if (!orderId) {
            navigate('/');
            return;
        }

        // 2. Handle Window Resize for Confetti
        const handleResize = () => {
            setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);

        // 3. Stop confetti after 7 seconds
        const timer = setTimeout(() => setShowConfetti(false), 7000);

        // Cleanup: Remove listener and timer when component unmounts
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timer);
        };
    }, [orderId, navigate]);

    const copyToClipboard = () => {
        if (orderId) {
            navigator.clipboard.writeText(orderId);
            swal("Copied!", "Order ID copied to clipboard", "success");
        }
    };

    return (
        <Container className="py-5 text-center">
            {showConfetti && (
                <Confetti 
                    width={windowDimension.width} 
                    height={windowDimension.height} 
                    recycle={showConfetti}
                />
            )}
            
            <Row className="justify-content-center">
                <Col md={7}>
                    <div className="mb-4">
                        <CheckCircleFill size={70} className="text-success animate__animated animate__bounceIn" />
                    </div>
                    
                    <h1 className="fw-bold mb-2">Payment Successful!</h1>
                    <p className="text-muted fs-5 mb-5">Your order is on its way to being processed.</p>

                    <Card className="border-0 shadow-sm rounded-4 mb-4 bg-light">
                        <Card.Body className="p-4">
                            <h6 className="text-uppercase text-muted small fw-bold mb-3">Order Details</h6>
                            
                            <div className="bg-white p-3 rounded-3 d-flex align-items-center justify-content-between border mb-3">
                                <div className="text-start">
                                    <span className="d-block small text-muted">Order ID</span>
                                    <span className="fw-mono fw-bold text-dark">{orderId || 'N/A'}</span>
                                </div>
                                <Button variant="link" className="text-dark p-0" onClick={copyToClipboard}>
                                    <Clipboard size={18} />
                                </Button>
                            </div>

                            <div className="d-flex justify-content-between align-items-center">
                                <div className="text-start">
                                    <span className="d-block small text-muted">Estimated Delivery</span>
                                    <span className="fw-bold">3-5 Business Days</span>
                                </div>
                                <div className="text-end">
                                    <span className="d-block small text-muted">Status</span>
                                    <span className="text-success fw-bold">Confirmed</span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    <div className="d-grid gap-3 d-md-flex justify-content-md-center">
                        <Link to="/" className="flex-grow-1">
                            <Button variant="dark" size="lg" className="w-100 py-3 rounded-pill shadow-sm">
                                <HouseFill className="me-2" /> Shop More
                            </Button>
                        </Link>
                        <Link to="/profile" className="flex-grow-1">
                            <Button variant="outline-dark" size="lg" className="w-100 py-3 rounded-pill">
                                <BagCheckFill className="me-2" /> View Order
                            </Button>
                        </Link>
                    </div>
                </Col>
            </Row>

            <style>{`
                .fw-mono { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; }
                .animate__bounceIn { animation: bounceIn 0.8s; }
                @keyframes bounceIn {
                    0% { opacity: 0; transform: scale(0.3); }
                    50% { opacity: 1; transform: scale(1.05); }
                    70% { transform: scale(0.9); }
                    100% { transform: scale(1); }
                }
            `}</style>
        </Container>
    );
};

export default SuccessScreen;