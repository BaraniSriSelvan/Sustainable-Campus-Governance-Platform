import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { validateEmail } from '../utils/validateEmail';

export default function StudentLogin() {
  const [form, setForm]           = useState({ email: '', password: '' });
  const [errors, setErrors]       = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading]     = useState(false);
  const [touched, setTouched]     = useState({});
  const { login } = useAuth();
  const navigate  = useNavigate();

  /* ── live change ── */
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setServerError('');

    // re-validate email on every keystroke so the green tick / red border updates live
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

    // Mark both fields touched so errors show
    setTouched({ email: true, password: true });

    const emailR = validateEmail(form.email);
    if (!emailR.valid) {
      setErrors(prev => ({ ...prev, email: emailR.message }));
      return;   // ← login blocked here — invalid email format
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
        role:     'student'
      });
      login(res.data.user, res.data.token);
      navigate('/student/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  /* ── field class helper ── */
  const fc = name => {
    if (!touched[name]) return 'sc-form-control';
    return `sc-form-control ${errors[name] ? 'field-error' : 'field-valid'}`;
  };

  // Disable submit while email is known-invalid
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

        <div className="auth-role-badge student">
          <i className="bi bi-mortarboard-fill"></i> Student Access
        </div>

        <h2 className="auth-title">Student Sign In</h2>
        <p className="auth-subtitle">Access your sustainability dashboard and submit feedback</p>

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
                placeholder="student@example.com"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="email"
              />
              {/* green tick when format is valid */}
              {touched.email && !errors.email && form.email && (
                <i className="bi bi-check-circle-fill input-icon-right valid"></i>
              )}
              {/* red X when format is invalid */}
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

        <div className="auth-link-row">
          Don't have an account?{' '}
          <Link to="/student/register" className="auth-link">Register here</Link>
        </div>

        <div className="auth-back">
          <button className="btn-ghost" onClick={() => navigate('/')}>
            <i className="bi bi-arrow-left"></i> Back to home
          </button>
        </div>

      </div>
    </div>
  );
}
