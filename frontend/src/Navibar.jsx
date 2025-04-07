// components/Navbar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  
  return (
    <nav className="navbar">
      <div className="logo">
        <h2>Face Recognition System</h2>
      </div>
      <ul className="nav-links">
        <li>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/register" className={location.pathname === '/register' ? 'active' : ''}>
            Register Face
          </Link>
        </li>
        <li>
          <Link to="/recognize" className={location.pathname === '/recognize' ? 'active' : ''}>
            Recognize Face
          </Link>
        </li>
        <li>
          <Link to="/attendance" className={location.pathname === '/attendance' ? 'active' : ''}>
            Attendance
          </Link>
        </li>
      </ul>
    </nav>
  );
};
export default Navbar;