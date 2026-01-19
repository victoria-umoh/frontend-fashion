import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../components/context/CartContext';
import { Row, Col, ListGroup, Button, Card } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';

const CartScreen = () => {
  const { cartItems, addToCart, removeFromCart } = useCart();
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const subtotal = cartItems.reduce((acc, item) => {
    const priceToUse = item.onSale ? item.promoPrice : item.price;
    return acc + item.qty * priceToUse;
  }, 0);

  const checkoutHandler = () => {
    navigate(userInfo ? '/shipping' : '/login?redirect=shipping');
  };

  return (
    <div className="container py-4">
      <Row>
        <Col md={8}>
          <h1 className="mb-4 uppercase tracking-tight font-bold text-2xl">Shopping Bag</h1>
          {cartItems.length === 0 ? (
            <div className="alert alert-info border-0 shadow-sm">
              Your bag is empty. <Link to="/" className="font-bold border-b border-black text-decoration-none text-dark">Go Shopping</Link>
            </div>
          ) : (
            <ListGroup variant="flush">
              {cartItems.map((item) => {
                const priceToUse = item.onSale ? item.promoPrice : item.price;
                return (
                  <ListGroup.Item key={`${item._id}-${item.size}`} className="py-4 px-0 bg-transparent">
                    <Row className="align-items-center">
                      <Col md={2} xs={3}>
                        <img src={item.image} alt={item.name} className="img-fluid rounded shadow-sm" />
                      </Col>
                      <Col md={4} xs={9}>
                        <Link to={`/product/${item._id}`} className="text-dark font-medium text-decoration-none hover:underline">
                          {item.name}
                        </Link>
                        {item.size && <div className="mt-1"><span className="badge bg-light text-dark border">Size: {item.size}</span></div>}
                        <div className="mt-1">
                          {item.onSale ? (
                            <span>
                              <span className="text-danger font-bold">${priceToUse}</span>
                              <del className="text-muted ms-2 small">${item.price}</del>
                            </span>
                          ) : <span className="text-muted small">${item.price}</span>}
                        </div>
                      </Col>
                      <Col md={3} xs={6} className="mt-3 mt-md-0">
                        <div className="d-flex align-items-center border rounded w-fit bg-white">
                          <button className="btn btn-sm px-3 py-1" onClick={() => addToCart(item, -1)} disabled={item.qty <= 1}> - </button>
                          <span className="px-2 font-semibold">{item.qty}</span>
                          <button className="btn btn-sm px-3 py-1" onClick={() => addToCart(item, 1)}> + </button>
                        </div>
                      </Col>
                      <Col md={3} xs={6} className="text-end mt-3 mt-md-0">
                        <Button variant="link" className="text-danger p-0 text-decoration-none" onClick={() => removeFromCart(item._id)}>
                          <FaTrash className="me-1" /> Remove
                        </Button>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          )}
        </Col>

        <Col md={4}>
          <Card className="shadow-sm border-0 p-4 bg-white sticky-top" style={{ top: '20px' }}>
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <ListGroup variant="flush">
              <ListGroup.Item className="px-0 d-flex justify-content-between border-0">
                <span>Items ({cartItems.reduce((acc, item) => acc + item.qty, 0)})</span>
                <span>${subtotal.toFixed(2)}</span>
              </ListGroup.Item>
              <ListGroup.Item className="px-0 d-flex justify-content-between border-0 mb-4 font-bold text-lg">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </ListGroup.Item>
            </ListGroup>
            <Button 
              className="w-full bg-black text-white py-3 rounded-pill border-0 font-bold uppercase tracking-widest"
              disabled={cartItems.length === 0}
              onClick={checkoutHandler}
            >
              Proceed To Checkout
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CartScreen;