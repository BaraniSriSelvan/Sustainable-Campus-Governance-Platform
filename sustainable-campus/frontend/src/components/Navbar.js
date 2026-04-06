import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sc-navbar navbar">
      <div className="container-fluid px-4">
        <div className="navbar-brand">
          <div className="brand-icon">🌱</div>
          <span>Sustainable Campus</span>
        </div>
        {user && (
          <div className="nav-user">
            <span>
              <i className={`bi bi-${user.role === 'admin' ? 'shield-check' : 'mortarboard'}-fill me-1`}></i>
              {user.name}
            </span>
            <button className="btn-logout" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-1"></i>Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
