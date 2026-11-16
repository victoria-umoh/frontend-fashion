import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Bag, Check2, Truck } from 'react-bootstrap-icons';
import { Button, Form } from 'react-bootstrap';
import API, { getImageUrl } from '../api';
import { useCart } from '../components/context/CartContext';
import Message from '../components/Message';
import Rating from './Rating';
import formatCurrency from '../utils/formatCurrency';
import { toast } from 'react-toastify';

const ProductScreen = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [canReview, setCanReview] = useState(false);

  const userInfo = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('userInfo') || 'null');
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    API.get(`/api/products/${id}`, { signal: controller.signal })
      .then(({ data }) => {
        setProduct(data);
        setSelectedSize(data.sizes?.length === 1 ? data.sizes[0] : '');
        setSelectedColor(data.colors?.length === 1 ? data.colors[0] : '');
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setError(requestError.response?.data?.message || 'We couldn’t load this piece. Please try again.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    if (!userInfo?.token || !product?._id) {
      setCanReview(false);
      return undefined;
    }

    const controller = new AbortController();
    const config = {
      headers: { Authorization: `Bearer ${userInfo.token}` },
      signal: controller.signal,
    };

    API.get('/api/orders/myorders', config)
      .then(({ data }) => {
        const hasPurchased = data.some((order) => (
          order.isPaid
          && order.orderItems.some((item) => String(item.product?._id || item.product) === String(product._id))
        ));
        setCanReview(hasPurchased);
      })
      .catch(() => {
        if (!controller.signal.aborted) setCanReview(false);
      });

    return () => controller.abort();
  }, [product?._id, userInfo]);

  const addToBag = () => {
    if (!product) return;
    if (product.sizes?.length && !selectedSize) {
      toast.error('Choose a size before adding this piece to your bag.');
      return;
    }
    if (product.colors?.length && !selectedColor) {
      toast.error('Choose a colour before adding this piece to your bag.');
      return;
    }
    if (Number(product.countInStock) < 1) {
      toast.error('This piece is currently out of stock.');
      return;
    }

    addToCart({ ...product, size: selectedSize, color: selectedColor }, quantity);
    toast.success('Added to your bag.');
  };

  const submitReview = async (event) => {
    event.preventDefault();
    if (!rating) {
      toast.error('Choose a rating first.');
      return;
    }

    try {
      await API.post(
        `/api/products/${id}/reviews`,
        { rating: Number(rating), comment },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      const { data } = await API.get(`/api/products/${id}`);
      setProduct(data);
      setRating('');
      setComment('');
      toast.success('Thank you for sharing your thoughts.');
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'Your review could not be submitted.');
    }
  };

  if (loading) {
    return <div className="container py-5"><p className="eyebrow">THE SAINT VICTORIA EDIT</p><h1>Finding your piece…</h1></div>;
  }

  if (error || !product) {
    return (
      <div className="container py-5">
        <Message variant="danger">{error || 'This piece could not be found.'}</Message>
        <Link className="button button-outline" to="/#collection"><ArrowLeft /> Back to the collection</Link>
      </div>
    );
  }

  const inStock = Number(product.countInStock) > 0;
  const salePrice = product.onSale && Number(product.promoPrice) > 0 ? product.promoPrice : product.price;

  return (
    <div className="container product-detail-page">
      <Link to="/#collection" className="back-link"><ArrowLeft aria-hidden="true" /> Back to the collection</Link>

      <div className="product-detail">
        <div className="detail-image-wrap">
          <img
            src={getImageUrl(product.image)}
            alt={`${product.name}${product.brand ? ` by ${product.brand}` : ''}`}
            className="detail-image"
          />
          {product.onSale && <span className="product-badge">A little less</span>}
        </div>

        <div className="detail-info">
          <p className="eyebrow">{product.category} {product.brand ? ` / ${product.brand}` : ''}</p>
          <h1 className="detail-title">{product.name}</h1>
          <div className="detail-rating">
            <Rating value={product.rating} text={`${product.numReviews || 0} reviews`} />
          </div>
          <div className="detail-price">
            <span>{formatCurrency(salePrice)}</span>
            {product.onSale && Number(product.promoPrice) > 0 && (
              <del>{formatCurrency(product.price)}</del>
            )}
          </div>
          <p className="detail-description">{product.description}</p>

          {product.sizes?.length > 0 && (
            <fieldset className="variant-fieldset">
              <legend>Choose size <span>{selectedSize || 'Required'}</span></legend>
              <div className="variant-options">
                {product.sizes.map((size) => (
                  <button
                    type="button"
                    key={size}
                    className={`variant-option${selectedSize === size ? ' is-selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                    aria-pressed={selectedSize === size}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {product.colors?.length > 0 && (
            <fieldset className="variant-fieldset">
              <legend>Choose colour <span>{selectedColor || 'Required'}</span></legend>
              <div className="variant-options">
                {product.colors.map((color) => (
                  <button
                    type="button"
                    key={color}
                    className={`variant-option${selectedColor === color ? ' is-selected' : ''}`}
                    onClick={() => setSelectedColor(color)}
                    aria-pressed={selectedColor === color}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <div className="detail-purchase-row">
            <Form.Label className="visually-hidden" htmlFor="product-quantity">Quantity</Form.Label>
            <Form.Control
              id="product-quantity"
              type="number"
              min="1"
              max={product.countInStock}
              value={quantity}
              onChange={(event) => setQuantity(Math.min(
                Number(product.countInStock) || 1,
                Math.max(1, Number(event.target.value) || 1)
              ))}
              className="detail-quantity"
              disabled={!inStock}
            />
            <Button className="button button-dark detail-add-button" onClick={addToBag} disabled={!inStock}>
              <Bag aria-hidden="true" /> {inStock ? 'Add to bag' : 'Sold out'}
            </Button>
          </div>

          <div className="detail-stock">
            {inStock ? <><Check2 aria-hidden="true" /> In stock — ready when you are</> : 'Currently out of stock'}
          </div>
          <div className="detail-promise"><Truck aria-hidden="true" /> Delivery and payment options shown at checkout.</div>
          <div className="detail-description-panel">
            <h2>A little about this piece</h2>
            <p>{product.description}</p>
            {product.sizes?.length > 0 && <p><strong>Available sizes:</strong> {product.sizes.join(', ')}</p>}
            {product.colors?.length > 0 && <p><strong>Available colours:</strong> {product.colors.join(', ')}</p>}
          </div>
        </div>
      </div>

      <section className="reviews-section">
        <div className="reviews-heading">
          <div>
            <p className="eyebrow">KIND WORDS</p>
            <h2>Notes from our customers</h2>
          </div>
          <Rating value={product.rating} text={`${product.numReviews || 0} reviews`} />
        </div>

        {userInfo?.token && canReview && (
          <Form onSubmit={submitReview} className="review-form">
            <Form.Group className="mb-3">
              <Form.Label>Your rating</Form.Label>
              <Form.Select value={rating} onChange={(event) => setRating(event.target.value)} required>
                <option value="">Choose a rating</option>
                <option value="5">5 — Loved it</option>
                <option value="4">4 — Really lovely</option>
                <option value="3">3 — Just right</option>
                <option value="2">2 — Not for me</option>
                <option value="1">1 — Disappointed</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Your note</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="What should another shopper know?"
                required
              />
            </Form.Group>
            <Button type="submit" className="button button-dark">Share your review</Button>
          </Form>
        )}

        {!product.reviews?.length ? (
          <p className="empty-reviews">No reviews yet. Your experience could be the first.</p>
        ) : (
          <div className="review-grid">
            {product.reviews.map((review) => (
              <article className="review-card" key={review._id}>
                <Rating value={review.rating} />
                <h3>{review.name}</h3>
                <p>{review.comment}</p>
                <time dateTime={review.createdAt}>
                  {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                </time>
              </article>
            ))}
          </div>
        )}

        {userInfo?.token && !canReview && (
          <p className="empty-reviews">Verified customers can leave a review after purchase.</p>
        )}
        {!userInfo?.token && (
          <p className="empty-reviews">Have this piece? <Link to="/login">Sign in</Link> to share a review.</p>
        )}
      </section>
    </div>
  );
};

export default ProductScreen;
