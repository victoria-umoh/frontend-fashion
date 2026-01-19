import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'react-bootstrap';
import Rating from '../pages/Rating';
// import Savings from '../components/Savings';


const ProductCard = ({ product }) => {
  return (
    // <div className="card h-100 border-0 shadow-sm">
    //   <img
    //     src={product.image}
    //     className="card-img-top"
    //     alt={product.name}
    //     style={{ height: '250px', objectFit: 'cover' }}
    //   />
    //   <div className="card-body d-flex flex-column">
    //     <h5 className="card-title text-dark fw-semibold">{product.name}</h5>
    //     <p className="card-text text-muted small">{product.brand}</p>
    //     <div className="mt-auto">
    //       <p className="card-text fw-bold text-dark">${product.price}</p>
    //       <Link to={`/product/${product._id}`} className="btn btn-outline-primary btn-sm w-100">
    //         View Details
    //       </Link>
    //     </div>
    //   </div>
    // </div>
    <Card className='my-3 p-3 rounded'>
      <Link to={`/product/${product._id}`}>
        <Card.Img src={product.image} variant='top' />
      </Link>

      <Card.Body>
        <Link title={product.name} to={`/product/${product._id}`}>
          <Card.Title as='div'><strong>{product.name}</strong></Card.Title>
        </Link>

        <Card.Text as='div'>
          <Rating value={product.rating} text={`${product.numReviews} reviews`} />
        </Card.Text>

        <Card.Text as='h3'>
          {product.onSale ? (
            <>
              <span className="text-danger">${product.promoPrice}</span>
              <del className="text-muted ms-2" style={{ fontSize: '1rem' }}>
                ${product.price}
              </del>
            </>
          ) : (
            `$${product.price}`
          )}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;