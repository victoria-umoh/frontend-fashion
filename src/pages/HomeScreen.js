// src/pages/HomeScreen.js
import React, { useEffect, useState } from 'react';
import API from '../api';
import ProductCard from '../components/ProductCard';

const HomeScreen = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await API.get('/api/products');
      // If data is an array, use it directly; if it's an object, try data.products
      setProducts(Array.isArray(data) ? data : (data.products || []));
    };
    fetchProducts();
  }, []);

  return (
    <>
      <div className="mb-5 text-center">
        <h2 className="display-4 fw-bold text-dark mb-3">New Arrivals</h2>
        <p className="text-muted">Carefully curated fashion for the modern professional.</p>
      </div>
      <div className="row g-4">
        {Array.isArray(products) && products.map((product) => (
          <div key={product._id} className="col-lg-3 col-md-6 col-sm-12">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </>
  );
};

export default HomeScreen;