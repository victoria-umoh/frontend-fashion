import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../components/context/CartContext';
import { Row, Col, ListGroup, Button, Card } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import { getImageUrl } from '../api';
import formatCurrency from '../utils/formatCurrency';

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
    <div className="container py-5 cart-page">
      <Row>
        <Col md={8}>
          <div className="page-heading">
            <p className="eyebrow">YOUR EDIT</p>
            <h1>Shopping bag <span>{cartItems.length}</span></h1>
          </div>
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <p>Your bag is waiting for something lovely.</p>
              <Link to="/#collection" className="button button-dark">Explore the collection</Link>
            </div>
          ) : (
            <ListGroup variant="flush" className="cart-list">
              {cartItems.map((item) => {
                const priceToUse = item.onSale ? item.promoPrice : item.price;
                return (
                  <ListGroup.Item key={`${item._id}-${item.size}-${item.color}`} className="py-4 px-0 bg-transparent">
                    <Row className="align-items-center">
                      <Col md={2} xs={3}>
                        <Link to={`/product/${item._id}`}>
                          <img src={getImageUrl(item.image)} alt={item.name} className="img-fluid cart-item-image" />
                        </Link>
                      </Col>
                      <Col md={4} xs={9}>
                        <Link to={`/product/${item._id}`} className="cart-item-name">
                          {item.name}
                        </Link>
                        {item.size && <div className="cart-item-detail">Size: {item.size}</div>}
                        {item.color && <div className="cart-item-detail">Color: {item.color}</div>}
                        <div className="cart-item-detail">
                          {item.onSale ? (
                            <span>
                              <span className="sale-price">{formatCurrency(priceToUse)}</span>
                              <del className="text-muted ms-2 small">{formatCurrency(item.price)}</del>
                            </span>
                          ) : <span>{formatCurrency(priceToUse)}</span>}
                        </div>
                      </Col>
                      <Col md={3} xs={6} className="mt-3 mt-md-0">
                        <div className="quantity-control" aria-label={`Quantity for ${item.name}`}>
                          <button type="button" onClick={() => addToCart(item, -1)} disabled={item.qty <= 1} aria-label="Decrease quantity">−</button>
                          <span>{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => addToCart(item, 1)}
                            disabled={item.qty >= Number(item.countInStock)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </Col>
                      <Col md={3} xs={6} className="text-end mt-3 mt-md-0">
                        <Button variant="link" className="cart-remove" onClick={() => removeFromCart(item._id, item.size || '', item.color || '')}>
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
          <Card className="commerce-card order-summary">
            <Card.Body>
              <p className="eyebrow">THE DETAILS</p>
              <h2>Order summary</h2>
            <ListGroup variant="flush">
              <ListGroup.Item className="px-0 d-flex justify-content-between border-0">
                <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)} items)</span>
                <span>{formatCurrency(subtotal)}</span>
              </ListGroup.Item>
              <ListGroup.Item className="px-0 d-flex justify-content-between border-0">
                <span>Shipping</span>
                <span className="text-muted">Calculated at checkout</span>
              </ListGroup.Item>
              <ListGroup.Item className="px-0 d-flex justify-content-between border-0 mb-4 cart-total">
                <span>Total</span>
                <span>{formatCurrency(subtotal)}</span>
              </ListGroup.Item>
            </ListGroup>
            <Button 
              className="w-100 button button-dark checkout-button"
              disabled={cartItems.length === 0}
              onClick={checkoutHandler}
            >
              Continue to checkout
            </Button>
            <Link to="/#collection" className="continue-shopping">Continue shopping</Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CartScreen;