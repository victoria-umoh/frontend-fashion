import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useCart } from './context/CartContext';

const Navbar = () => {
  const { cartItems, clearCart } = useCart();
  
  // Calculate total items in cart
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const logoutHandler = () => {
    // Save cart for this user before clearing
    localStorage.setItem('cart_' + userInfo.id, JSON.stringify(cartItems));
    localStorage.removeItem('userInfo');
    clearCart();
    window.location.href = '/login';
  };

  const [showNav, setShowNav] = useState(false);

  const handleToggle = () => setShowNav((prev) => !prev);
  const handleNavLinkClick = () => setShowNav(false);

  return (
    <nav className="navbar navbar-expand-lg shadow-sm colorful-navbar">
      <div className="container">
        <Link className="navbar-brand fw-bold fs-4 text-white" to="/">
          <span style={{
            background: 'linear-gradient(90deg, #ff6a00 100%, #f8f0f4 100%)',
            WebkitBackgroundClip: 'text',
            fontWeight: 800
          }}>
            Saint Victoria
          </span>
        </Link>
        <button
          className="navbar-toggler border-0 p-2"
          type="button"
          aria-label="Toggle navigation"
          style={{ outline: 'none' }}
          onClick={handleToggle}
          aria-expanded={showNav}
        >
          <span style={{ display: 'inline-block', width: 28, height: 28 }}>
            <svg viewBox="0 0 32 32" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect y="6" width="32" height="4" rx="2" fill="#fff" />
              <rect y="14" width="32" height="4" rx="2" fill="#fff" />
              <rect y="22" width="32" height="4" rx="2" fill="#fff" />
            </svg>
          </span>
        </button>
        <div className={`collapse navbar-collapse${showNav ? ' show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/" onClick={handleNavLinkClick}>
                Home
              </Link>
            </li>
            {/* <li className="nav-item">
              <Link className="nav-link" to="/products">
                Products
              </Link>
            </li> */}
            <li className="nav-item">
              <Link className="nav-link" to="/cart" onClick={handleNavLinkClick}>
                Cart ({cartCount})
              </Link>
            </li>
            {userInfo && userInfo.role === 'user' ? (
              <li className='nav-item'>
                <NavDropdown title={userInfo.name} id='username'>
                  <LinkContainer to='/profile'>
                    <NavDropdown.Item>Profile</NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Item onClick={logoutHandler}>Logout</NavDropdown.Item>
                </NavDropdown>
              </li>
            ) : (
              <li className="nav-item">
                <Link className="nav-link" to="/login" onClick={handleNavLinkClick}>
                  Login
                </Link>
              </li>
            )}
           {/* FIXED: Wrapped in an <li> and added a null check for isAdmin */}
            {userInfo && userInfo.role === 'admin' && (
              <li className='nav-item'>
                <NavDropdown title={userInfo.name || 'Admin'} id='adminmenu' className="ms-lg-3">
                  <LinkContainer to='/admin/dashboard'>
                    <NavDropdown.Item>Dashboard</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to='/admin/dashboard'>
                    <NavDropdown.Item>Products</NavDropdown.Item>
                  </LinkContainer>
                  {/* <LinkContainer to='/admin/orderlist'>
                    <NavDropdown.Item>Orders</NavDropdown.Item>
                  </LinkContainer> */}
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={logoutHandler}>Logout</NavDropdown.Item>
                </NavDropdown>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;