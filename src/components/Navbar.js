import React from 'react';
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

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold fs-4 text-dark" to="/">
          FashionStore
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link text-secondary" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-secondary" to="/products">
                Products
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-secondary" to="/cart">
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
                <Link className="nav-link text-secondary" to="/login">
                  Login
                </Link>
              </li>
            )}
           {/* FIXED: Wrapped in an <li> and added a null check for isAdmin */}
            {userInfo && userInfo.role === 'admin' && (
              <li className='nav-item'>
                <NavDropdown title='Admin' id='adminmenu' className="ms-lg-3">
                  <LinkContainer to='/admin/dashboard'>
                    <NavDropdown.Item>Dashboard</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to='/admin/productlist'>
                    <NavDropdown.Item>Products</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to='/admin/orderlist'>
                    <NavDropdown.Item>Orders</NavDropdown.Item>
                  </LinkContainer>
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