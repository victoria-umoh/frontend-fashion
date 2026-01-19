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
    <div className="bg-dark text-white min-vh-100 p-3 shadow-lg" style={{ width: '260px' }}>
      <div className="text-center mb-5 mt-3">
        <h5 className="text-uppercase tracking-widest font-bold">Admin Panel</h5>
        <hr className="bg-secondary" />
      </div>

      <nav className="nav flex-column gap-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.link}
            className={`nav-link d-flex align-items-center justify-content-between rounded transition-all py-3 px-3 ${
              path === item.link ? 'bg-primary text-white' : 'text-secondary hover:bg-gray-800'
            }`}
          >
            <div className="d-flex align-items-center gap-3">
              {item.icon}
              <span>{item.name}</span>
            </div>
            {path === item.link && <FaChevronRight size={10} />}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;