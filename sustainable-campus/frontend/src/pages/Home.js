import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    setTimeout(() => navigate(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'), 100);
  }

  return (
    <div className="home-page">
      <div className="home-bg-orb home-bg-orb-1" />
      <div className="home-bg-orb home-bg-orb-2" />
      <div className="home-bg-orb home-bg-orb-3" />

      <div className="home-content">
        <div className="home-badge">
          <i className="bi bi-leaf-fill"></i>
          Campus Sustainability Initiative
        </div>

        <h1 className="home-title">
          Sustainable Campus<br />
          <span className="accent">Governance Platform</span>
        </h1>

        <p className="home-subtitle">
          Monitor energy, water, and waste metrics in real time.
          Empowering students and administrators to build a greener campus together.
        </p>

        <div className="role-cards">
          <Link to="/admin/login" className="role-card">
            <div className="role-card-icon admin">🏛️</div>
            <h4>Admin Portal</h4>
            <p>Manage sustainability data, events, and monitor campus performance</p>
          </Link>
          <Link to="/student/login" className="role-card">
            <div className="role-card-icon student">🎓</div>
            <h4>Student Portal</h4>
            <p>View sustainability scores, events, and submit feedback</p>
          </Link>
        </div>

        <div className="home-stats">
          <div className="home-stat">
            <div className="home-stat-num">3</div>
            <div className="home-stat-label">Metrics Tracked</div>
          </div>
          <div className="home-stat">
            <div className="home-stat-num">Real-time</div>
            <div className="home-stat-label">Data Updates</div>
          </div>
          <div className="home-stat">
            <div className="home-stat-num">100%</div>
            <div className="home-stat-label">Transparency</div>
          </div>
        </div>
      </div>
    </div>
  );
}
