import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Form, ListGroup, Button, Col } from 'react-bootstrap';
import API from '../api';
import { useCart } from '../components/context/CartContext';
import Message from '../components/Message';
import Rating from './Rating';
import Swal from 'sweetalert2'
import { toast } from 'react-toastify';



const ProductScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart(); // Use the cart function

  const [product, setProduct] = useState({});
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');


  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [canReview, setCanReview] = useState(false);

  // Get userInfo from localStorage for use in render and submitHandler
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  useEffect(() => {
    const checkEligibility = async () => {
      if (userInfo && userInfo.token && product._id) {
        try {
          const config = {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${userInfo.token}`,
            },
          };
          const { data } = await API.get('/api/orders/myorders', config);
          const hasPurchased = data.some(order =>
            order.isPaid && order.orderItems.some(item => item.product === product._id)
          );
          setCanReview(hasPurchased);
        } catch (err) {
          setCanReview(false);
        }
      } else {
        setCanReview(false);
      }
    };
    checkEligibility();
  }, [product._id, userInfo]);


  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await API.get(`/api/products/${id}`);
      setProduct(data);
    };
    fetchProduct();
  }, [id]);

  // Handler for adding to cart
  const addToCartHandler = () => {
    if (!selectedSize && product.sizes?.length > 0) {
      // Swal.fire('Please select a size');
      Swal.fire({
              text: 'Please select a size before adding to cart.',
              icon: 'warning',
              timer: 3000,
              showConfirmButton: false});
      return;
    }
    // We pass the product, quantity, and the selected size to the context
    addToCart({ ...product, size: selectedSize }, qty);
    navigate('/cart'); // Redirect to cart page after adding
  };

// Handler for submitting a review/rating
const submitHandler = async (e) => {
  e.preventDefault();
  
  if (rating === 0) {
    toast.error('Please select a rating');
    return;
  }


  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    await API.post(`/api/products/${id}/reviews`, { rating, comment }, config);
    
    toast.success('Review submitted successfully!');
    setRating(0);
    setComment('');
    // Refresh product details to show the new review
    // Refresh product details to show the new review
    // Re-fetch product data
    const { data } = await API.get(`/api/products/${id}`);
    setProduct(data);
  } catch (err) {
    toast.error(err.response?.data.message || 'Already reviewed this product');
  }
};

const Savings = ({ price, promoPrice }) => {
  if (!promoPrice || promoPrice >= price) return null;
  
  const percentage = Math.round(((price - promoPrice) / price) * 100);
  
  return (
    <div className="promo-badge">
      <span className="text-danger">Save {percentage}%!</span>
      <h3 className="text-success">${promoPrice}</h3>
      <del className="text-muted">${price}</del>
    </div>
  );
};

  return (
    <div className="container py-5">
      <Link to="/" className="text-muted small mb-4 d-inline-block">
        ← Back to Collection
      </Link>
      
      <div className="row g-5">
        <div className="col-md-6">
          <div className="rounded shadow">
            <img src={product.image} alt={product.name} className="img-fluid w-100 rounded" />
          </div>
        </div>

        <div className="col-md-6 d-flex flex-column gap-3">
          <h1 className="display-4 fw-bold text-dark">{product.name}</h1>
          {/* Show savings if promoPrice exists, else show regular price */}
          {product.promoPrice ? (
            <Savings price={product.price} promoPrice={product.promoPrice} />
          ) : (
            <p className="h4 text-dark">${product.price}</p>
          )}
          <hr />
          <p className="text-muted">{product.description}</p>
          
          {/* Size Selection */}
          {product.sizes?.length > 0 && (
            <div>
              <h3 className="h6 fw-semibold text-dark mb-3">Select Size</h3>
              <div className="d-flex gap-2">
                {product.sizes.map((size) => (
                  <button 
                    key={size} 
                    className={`btn ${selectedSize === size ? 'btn-dark' : 'btn-outline-secondary'} text-uppercase`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selection */}
          <div className="d-flex align-items-center gap-3">
            <h3 className="h6 fw-semibold text-dark mb-0">Quantity</h3>
            <Form.Control
              as="select"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              style={{ width: '80px' }}
            >
              {[...Array(product.countInStock > 0 ? product.countInStock : 10).keys()].map((x) => (
                <option key={x + 1} value={x + 1}>
                  {x + 1}
                </option>
              ))}
            </Form.Control>
          </div>
          
           <button 
            className="btn btn-dark w-100 rounded-pill fw-bold text-uppercase py-3"
            onClick={addToCartHandler}
            disabled={product.countInStock === 0}
          >
            {product.countInStock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
      <div className="my-5">
        <ListGroup.Item className="p-4 shadow-sm rounded bg-light border-0">
          <h2 className="mb-4 text-center text-primary fw-bold" style={{ letterSpacing: '1px' }}>Write a Customer Review</h2>
          {userInfo ? (
            canReview ? (
              <Form onSubmit={submitHandler} className="review-form">
                <Form.Group controlId='rating' className='mb-3'>
                  <Form.Label className="fw-semibold">Rating</Form.Label>
                  <Form.Control
                    as='select'
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="mb-2"
                    style={{ maxWidth: '200px' }}
                  >
                    <option value=''>Select...</option>
                    <option value='1'>1 - Poor</option>
                    <option value='2'>2 - Fair</option>
                    <option value='3'>3 - Good</option>
                    <option value='4'>4 - Very Good</option>
                    <option value='5'>5 - Excellent</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group controlId='comment' className='mb-3'>
                  <Form.Label className="fw-semibold">Comment</Form.Label>
                  <Form.Control
                    as='textarea'
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What did you think of the product?"
                    className="mb-2"
                    style={{ minHeight: '100px', resize: 'vertical' }}
                  ></Form.Control>
                </Form.Group>
                <div className="d-grid">
                  <Button type='submit' variant='primary' size="lg" className="rounded-pill fw-bold">
                    Submit
                  </Button>
                </div>
              </Form>
            ) : (
              <Message variant='info'>Only customers who bought this product can leave a review.</Message>
            )
          ) : (
            <Message>
              Please <Link to='/login'>sign in</Link> to write a review
            </Message>
          )}
        </ListGroup.Item>
        <Col md={6}>
          <h2>Reviews</h2>
          {Array.isArray(product.reviews) && product.reviews.length === 0 && <Message>No Reviews</Message>}
          <ListGroup variant='flush'>
            {Array.isArray(product.reviews) && product.reviews.map((review) => (
              <ListGroup.Item key={review._id}>
                <strong>{review.name}</strong>
                <Rating value={review.rating} />
                <p>{review.createdAt.substring(0, 10)}</p>
                <p>{review.comment}</p>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </div>
    </div>
  );
};

export default ProductScreen;