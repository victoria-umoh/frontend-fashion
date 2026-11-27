import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'react-bootstrap-icons';

const Footer = () => (
  <footer className="site-footer" id="footer">
    <div className="footer-main">
      <div className="footer-brand">
        <Link className="brand-mark footer-logo" to="/">SAINT VICTORIA</Link>
        <p>Wear what feels like you.</p>
      </div>
      <div className="footer-links">
        <h2>Explore</h2>
        <Link to="/#collection">Shop all</Link>
        <Link to="/profile">Your account</Link>
        <Link to="/myorders">Order history</Link>
      </div>
      <div className="footer-links">
        <h2>Need a hand?</h2>
        <a href="mailto:hello@saintvictoria.com">Contact us <ArrowUpRight aria-hidden="true" /></a>
        <Link to="/cart">Shopping bag</Link>
      </div>
    </div>
    <div className="footer-bottom">
      <span>© {new Date().getFullYear()} Saint Victoria</span>
      <span>Thoughtfully chosen. Made to be lived in.</span>
    </div>
  </footer>
);

export default Footer;
