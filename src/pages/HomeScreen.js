import React, { useEffect, useState } from 'react';
import API from '../api';
import ProductCard from '../components/ProductCard';


const HomeScreen = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await API.get('/api/products');
      setProducts(Array.isArray(data) ? data : (data.products || []));
    };
    fetchProducts();
  }, []);

  // Extract unique categories from products
  const categories = Array.from(
    new Set(products.map((p) => (p.category && p.category.name) || p.category || ''))
  ).filter(Boolean);

  // Filter products by selected category
  const filteredProducts = products.filter((p) =>
    selectedCategory ? ((p.category && p.category.name) || p.category) === selectedCategory : true
  );

  return (
    <>
      <div className="mb-5 text-center">
        <h2 className="display-4 fw-bold text-dark mb-3">New Arrivals</h2>
        <p className="text-muted">Carefully curated fashion for the modern professional.</p>
      </div>

      {/* Category Filter Buttons */}
      {categories.length > 0 && (
        <div className="mb-4 text-center">
          <button
            className={`btn btn-outline-dark mx-1 mb-2${selectedCategory === '' ? ' active' : ''}`}
            onClick={() => setSelectedCategory('')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`btn btn-outline-dark mx-1 mb-2${selectedCategory === cat ? ' active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="row g-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product._id} className="col-lg-3 col-md-6 col-sm-12">
              <div className="product-card h-100">
                <ProductCard product={product} />
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center text-muted">No products found.</div>
        )}
      </div>
    </>
  );
};

export default HomeScreen;