import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaBox, FaShoppingCart, FaUsers, FaTicketAlt, 
  FaChartLine, FaChevronRight 
} from 'react-icons/fa';

const AdminSidebar = () => {
  const location = useLocation();
  const path = location.pathname;

  const menuItems = [
    { name: 'Dashboard', icon: <FaChartLine />, link: '/admin/dashboard' },
    { name: 'Products', icon: <FaBox />, link: '/admin/productlist' },
    { name: 'Orders', icon: <FaShoppingCart />, link: '/admin/orderlist' },
    { name: 'Users', icon: <FaUsers />, link: '/admin/userlist' },
    { name: 'Coupons', icon: <FaTicketAlt />, link: '/admin/couponlist' },
  ];

  return (
    <aside className="admin-sidebar">
      <Link to="/admin/dashboard" className="admin-brand">SAINT VICTORIA <span>STUDIO</span></Link>
      <nav className="admin-nav" aria-label="Admin navigation">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.link}
            className={`admin-nav-link${path === item.link ? ' is-active' : ''}`}
            aria-current={path === item.link ? 'page' : undefined}
          >
            {item.icon}
            <span>{item.name}</span>
            {path === item.link && <FaChevronRight size={10} />}
          </Link>
        ))}
      </nav>
      <Link to="/" className="admin-store-link">← Back to the store</Link>
    </aside>
  );
};

export default AdminSidebar;