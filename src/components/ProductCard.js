import React from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../api';
import Rating from '../pages/Rating';
import formatCurrency from '../utils/formatCurrency';


const ProductCard = ({ product }) => {
  const isOnSale = product.onSale && Number(product.promoPrice) > 0;
  const price = isOnSale ? product.promoPrice : product.price;

  return (
    <article className="product-card">
      <Link className="product-image-link" to={`/product/${product._id}`} aria-label={`View ${product.name}`}>
        <div className="product-image-frame">
          <img
            src={getImageUrl(product.image)}
            alt={`${product.name}${product.brand ? ` by ${product.brand}` : ''}`}
            className="product-image"
            loading="lazy"
            decoding="async"
          />
          {isOnSale && <span className="product-badge">A little less</span>}
          {Number(product.countInStock) === 0 && <span className="product-badge product-badge-muted">Sold out</span>}
        </div>
      </Link>
      <div className="product-card-content">
        <div className="product-card-meta">
          <span>{product.category}</span>
          <Rating value={product.rating} text={product.numReviews ? `(${product.numReviews})` : ''} />
        </div>
        <Link title={product.name} to={`/product/${product._id}`} className="product-title-link">
          <h3>{product.name}</h3>
        </Link>
        <div className="product-card-bottom">
          <div className="product-price">
            <span>{formatCurrency(price)}</span>
            {isOnSale && <del>{formatCurrency(product.price)}</del>}
          </div>
          <Link to={`/product/${product._id}`} className="product-view-link">
            Discover <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;