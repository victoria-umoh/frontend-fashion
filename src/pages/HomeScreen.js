import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Search } from 'react-bootstrap-icons';
import API, { getImageUrl } from '../api';
import ProductCard from '../components/ProductCard';
import Message from '../components/Message';

const PAGE_SIZE = 8;

const HomeScreen = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    API.get('/api/products', {
      params: { keyword, category, sort, page, limit: PAGE_SIZE },
      signal: controller.signal,
    })
      .then(({ data }) => {
        const result = Array.isArray(data) ? { products: data } : data;
        const nextProducts = Array.isArray(result?.products) ? result.products : [];
        setProducts(nextProducts);
        setCategories(Array.isArray(result?.categories) ? result.categories : []);
        setTotal(Number(result?.total ?? nextProducts.length));
        setPages(Number(result?.pages ?? 1));
        setError('');
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setError('We couldn’t load the collection. Please check your connection and try again.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [keyword, category, sort, page, retryCount]);

  const featuredProduct = products[0];

  useEffect(() => {
    if (location.hash === '#collection') {
      document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.hash]);

  const submitSearch = (event) => {
    event.preventDefault();
    setKeyword(searchInput.trim());
    setPage(1);
  };

  const selectCategory = (nextCategory) => {
    setCategory(nextCategory);
    setPage(1);
  };

  return (
    <div className="storefront">
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">THE SAINT VICTORIA EDIT</p>
          <h1>Style that feels like <em>you.</em></h1>
          <p className="hero-description">
            Considered pieces for the days you remember and the everyday in between.
          </p>
          <Link className="button button-dark hero-cta" to="/#collection">
            Explore the collection <ArrowRight aria-hidden="true" />
          </Link>
          <p className="hero-caption">Thoughtfully chosen. Made to be lived in.</p>
        </div>
        <div className="hero-image-wrap">
          <img
            src={getImageUrl(featuredProduct?.image || '/assets/images/young-woman-beautiful-red-dress.jpg')}
            alt={featuredProduct?.name || 'Featured Saint Victoria look'}
            className="hero-image"
          />
          <div className="hero-image-caption">
            <span>THE NEW SEASON</span>
            <strong>{featuredProduct?.name || 'A little more you'}</strong>
          </div>
          <span className="hero-image-index">01 / 07</span>
        </div>
      </section>

      <section className="promise-strip" aria-label="Shopping benefits">
        <div><span className="promise-mark">01</span><span>Curated, not crowded</span></div>
        <div><span className="promise-mark">02</span><span>Secure online checkout</span></div>
        <div><span className="promise-mark">03</span><span>Order updates, every step</span></div>
      </section>

      <section className="collection-section" id="collection">
        <div className="collection-heading">
          <div>
            <p className="eyebrow">FIND YOUR NEXT FAVOURITE</p>
            <h2>The collection</h2>
          </div>
          <p className="collection-count">{total} considered pieces</p>
        </div>

        <div className="collection-toolbar">
          <form className="collection-search" onSubmit={submitSearch} role="search">
            <Search aria-hidden="true" />
            <input
              type="search"
              aria-label="Search products"
              placeholder="Search styles, brands, categories"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <button type="submit">Search</button>
          </form>
          <label className="sort-control">
            <span>Sort by</span>
            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setPage(1);
              }}
            >
              <option value="newest">Latest</option>
              <option value="rating">Top rated</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="name">Name</option>
            </select>
          </label>
        </div>

        <div className="category-list" aria-label="Filter by category">
          <button
            type="button"
            className={`category-chip${category === '' ? ' is-active' : ''}`}
            onClick={() => selectCategory('')}
            aria-pressed={category === ''}
          >
            All pieces
          </button>
          {categories.map((item) => (
            <button
              type="button"
              key={item}
              className={`category-chip${category === item ? ' is-active' : ''}`}
              onClick={() => selectCategory(item)}
              aria-pressed={category === item}
            >
              {item}
            </button>
          ))}
        </div>

        {error && (
          <Message variant="danger">
            {error}{' '}
            <button
              type="button"
              className="btn btn-link p-0 align-baseline"
              onClick={() => setRetryCount((count) => count + 1)}
            >
              Try again
            </button>
          </Message>
        )}

        {loading ? (
          <div className="product-grid" aria-label="Loading products">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="product-skeleton" key={index}>
                <div className="skeleton-image" />
                <div className="skeleton-line" />
                <div className="skeleton-line skeleton-line-short" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            {pages > 1 && (
              <nav className="pagination-bar" aria-label="Product pages">
                <button
                  type="button"
                  className="pagination-button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                >
                  <ArrowLeft aria-hidden="true" /> Previous
                </button>
                <span>Page {page} of {pages}</span>
                <button
                  type="button"
                  className="pagination-button"
                  onClick={() => setPage((current) => Math.min(pages, current + 1))}
                  disabled={page === pages}
                >
                  Next <ArrowRight aria-hidden="true" />
                </button>
              </nav>
            )}
          </>
        ) : !error ? (
          <div className="empty-collection">
            <p className="eyebrow">NOTHING HERE JUST YET</p>
            <h3>No pieces found</h3>
            <p>Try another search or clear your filters to see the full collection.</p>
            <button
              type="button"
              className="button button-outline"
              onClick={() => {
                setSearchInput('');
                setKeyword('');
                selectCategory('');
              }}
            >
              Clear filters
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default HomeScreen;