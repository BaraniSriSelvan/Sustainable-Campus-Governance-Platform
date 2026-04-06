import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { validateEmail } from '../utils/validateEmail';

export default function AdminLogin() {
  const [form, setForm]               = useState({ email: '', password: '' });
  const [errors, setErrors]           = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading]         = useState(false);
  const [touched, setTouched]         = useState({});
  const { login } = useAuth();
  const navigate  = useNavigate();

  /* ── live change ── */
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setServerError('');

    if (name === 'email') {
      const r = validateEmail(value);
      setErrors(prev => ({ ...prev, email: r.valid ? '' : r.message }));
    }
    if (name === 'password') {
      setErrors(prev => ({ ...prev, password: value ? '' : 'Password is required' }));
    }
  };

  /* ── on blur: mark touched ── */
  const handleBlur = e => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    if (name === 'email') {
      const r = validateEmail(value);
      setErrors(prev => ({ ...prev, email: r.valid ? '' : r.message }));
    }
    if (name === 'password' && !value) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
    }
  };

  /* ── submit: block if email format invalid ── */
  const handleSubmit = async e => {
    e.preventDefault();
    setServerError('');
    setTouched({ email: true, password: true });

    const emailR = validateEmail(form.email);
    if (!emailR.valid) {
      setErrors(prev => ({ ...prev, email: emailR.message }));
      return;   // ← login blocked — invalid email format
    }
    if (!form.password) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/login', {
        email:    form.email.trim().toLowerCase(),
        password: form.password,
        role:     'admin'
      });
      login(res.data.user, res.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  /* ── field class helper ── */
  const fc = name => {
    if (!touched[name]) return 'sc-form-control';
    return `sc-form-control ${errors[name] ? 'field-error' : 'field-valid'}`;
  };

  const emailInvalid = !validateEmail(form.email).valid;

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">🌱</div>
          <div className="auth-logo-text">
            Sustainable Campus
            <small>Governance Platform</small>
          </div>
        </div>

        <div className="auth-role-badge admin">
          <i className="bi bi-shield-lock-fill"></i> Administrator Access
        </div>

        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to manage campus sustainability data and events</p>

        {/* Server error */}
        {serverError && (
          <div className="sc-alert error">
            <i className="bi bi-exclamation-circle me-2"></i>{serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          {/* Email */}
          <div className="form-group">
            <label className="sc-form-label">Email Address</label>
            <div className="input-icon-wrap">
              <input
                className={fc('email')}
                type="email"
                name="email"
                placeholder="admin@campus.edu"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="email"
              />
              {touched.email && !errors.email && form.email && (
                <i className="bi bi-check-circle-fill input-icon-right valid"></i>
              )}
              {touched.email && errors.email && (
                <i className="bi bi-x-circle-fill input-icon-right" style={{ color: '#dc3545' }}></i>
              )}
            </div>
            {touched.email && errors.email && (
              <div className="field-error-msg">
                <i className="bi bi-exclamation-circle"></i> {errors.email}
              </div>
            )}
            {touched.email && !errors.email && form.email && (
              <div className="field-hint" style={{ color: '#1e7a3c' }}>
                <i className="bi bi-check2 me-1"></i>Valid email format
              </div>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="sc-form-label">Password</label>
            <input
              className={fc('password')}
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="current-password"
            />
            {touched.password && errors.password && (
              <div className="field-error-msg">
                <i className="bi bi-exclamation-circle"></i> {errors.password}
              </div>
            )}
          </div>

          {/* Submit — disabled while email format is invalid */}
          <button
            className="btn-sc-primary mt-2"
            type="submit"
            disabled={loading || (touched.email && emailInvalid)}
          >
            {loading
              ? <><div className="loader-ring" style={{ width: 18, height: 18, borderWidth: 2 }}></div> Signing in...</>
              : <><i className="bi bi-box-arrow-in-right"></i> Sign In</>}
          </button>

        </form>

        <div className="auth-back">
          <button className="btn-ghost" onClick={() => navigate('/')}>
            <i className="bi bi-arrow-left"></i> Back to home
          </button>
        </div>

      </div>
    </div>
  );
}
