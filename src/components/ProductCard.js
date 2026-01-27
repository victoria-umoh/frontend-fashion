import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'react-bootstrap';
import Rating from '../pages/Rating';


const ProductCard = ({ product }) => {
  return (
    <Card className='my-3 p-3 rounded d-flex flex-column'>
      <Link to={`/product/${product._id}`}> 
        <Card.Img 
          src={product.image} 
          variant='top' 
          className='card-img-top' 
          style={{ height: '300px', objectFit: 'cover' }} 
        />
      </Link>
      <Card.Body className='d-flex flex-column'>
        <Link title={product.name} to={`/product/${product._id}`} className='text-underline-none'>
          <Card.Title as='div'>
            <strong>{product.name}</strong>
          </Card.Title>
        </Link>
        <Card.Text as='h3' className='mt-auto'>
          {product.onSale ? (
            <>
              <span className="text-danger">₦{product.promoPrice}</span>
              <del className="text-muted ms-2" style={{ fontSize: '1rem' }}>
                ₦{product.price}
              </del>
            </>
          ) : (
            `₦${product.price}`
          )}
        </Card.Text>
        <Card.Text as='p'>
          <Rating value={product.rating} text={`${product.numReviews} reviews`} />
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;