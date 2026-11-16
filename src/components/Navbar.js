import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bag, List, Person, XLg } from 'react-bootstrap-icons';
import { useCart } from './context/CartContext';

const Navbar = () => {
  const { cartItems, clearCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  let userInfo = null;
  try {
    userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
  } catch {
    localStorage.removeItem('userInfo');
  }

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    clearCart();
    navigate('/login');
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="announcement-bar">
        <span>THE NEW SEASON IS HERE</span>
        <Link to="/#collection" onClick={closeMenu}>Discover the edit <span aria-hidden="true">→</span></Link>
      </div>
      <nav className="site-nav" aria-label="Main navigation">
        <div className="site-nav-inner">
          <Link className="brand-mark" to="/" onClick={closeMenu}>SAINT VICTORIA</Link>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <XLg aria-hidden="true" /> : <List aria-hidden="true" />}
        </button>
          <div className={`site-nav-content${menuOpen ? ' is-open' : ''}`} id="primary-navigation">
            <div className="site-nav-links">
              <Link
                className={location.pathname === '/' ? 'is-current' : ''}
                to="/#collection"
                onClick={closeMenu}
              >
                Shop
              </Link>
              <Link to="/#collection" onClick={closeMenu}>New arrivals</Link>
              <a href="#footer" onClick={closeMenu}>Our world</a>
            </div>
            <div className="site-nav-actions">
              {userInfo?.role === 'admin' && (
                <Link to="/admin/dashboard" onClick={closeMenu}>Studio</Link>
              )}
              <Link to={userInfo ? '/profile' : '/login'} onClick={closeMenu} aria-label={userInfo ? 'My account' : 'Sign in'}>
                <Person aria-hidden="true" />
                <span>{userInfo?.name?.split(' ')[0] || 'Account'}</span>
              </Link>
              {userInfo && (
                <button type="button" className="nav-signout" onClick={logoutHandler}>
                  Sign out
                </button>
              )}
              <Link className="bag-link" to="/cart" onClick={closeMenu} aria-label={`Shopping bag, ${cartCount} items`}>
                <Bag aria-hidden="true" />
                <span>Bag</span>
                <span className="bag-count">{cartCount}</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;