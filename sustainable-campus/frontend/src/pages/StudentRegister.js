import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { validateEmail } from '../utils/validateEmail';

export default function StudentRegister() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const handleBlur = e => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    let msg = '';
    if (name === 'name' && !value.trim()) msg = 'Full name is required';
    if (name === 'email') { const r = validateEmail(value); if (!r.valid) msg = r.message; }
    if (name === 'password' && value.length < 6) msg = 'Password must be at least 6 characters';
    if (name === 'confirm' && value !== form.password) msg = 'Passwords do not match';
    setErrors(prev => ({ ...prev, [name]: msg }));
  };

  const validateAll = () => {
    const newErrors = {};
    let valid = true;
    if (!form.name.trim()) { newErrors.name = 'Full name is required'; valid = false; }
    const emailR = validateEmail(form.email);
    if (!emailR.valid) { newErrors.email = emailR.message; valid = false; }
    if (form.password.length < 6) { newErrors.password = 'Password must be at least 6 characters'; valid = false; }
    if (form.confirm !== form.password) { newErrors.confirm = 'Passwords do not match'; valid = false; }
    setErrors(newErrors);
    setTouched({ name: true, email: true, password: true, confirm: true });
    return valid;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setServerError('');
    if (!validateAll()) return;
    setLoading(true);
    try {
      const res = await API.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password
      });
      login(res.data.user, res.data.token);
      navigate('/student/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fc = (name) => {
    if (!touched[name]) return 'sc-form-control';
    return `sc-form-control ${errors[name] ? 'field-error' : 'field-valid'}`;
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🌱</div>
          <div className="auth-logo-text">
            Sustainable Campus
            <small>Governance Platform</small>
          </div>
        </div>

        <div className="auth-role-badge student">
          <i className="bi bi-person-plus-fill"></i> Create Student Account
        </div>

        <h2 className="auth-title">Join the platform</h2>
        <p className="auth-subtitle">Register to view sustainability data and submit your feedback</p>

        {serverError && (
          <div className="sc-alert error">
            <i className="bi bi-exclamation-circle me-2"></i>{serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="sc-form-label">Full Name</label>
            <input
              className={fc('name')} type="text" name="name"
              placeholder="Your full name"
              value={form.name} onChange={handleChange} onBlur={handleBlur}
            />
            {touched.name && errors.name && (
              <div className="field-error-msg"><i className="bi bi-exclamation-circle"></i> {errors.name}</div>
            )}
          </div>

          <div className="form-group">
            <label className="sc-form-label">Email Address</label>
            <div className="input-icon-wrap">
              <input
                className={fc('email')} type="email" name="email"
                placeholder="student@example.com"
                value={form.email} onChange={handleChange} onBlur={handleBlur}
              />
              {touched.email && !errors.email && form.email && (
                <i className="bi bi-check-circle-fill input-icon-right valid"></i>
              )}
              {touched.email && errors.email && (
                <i className="bi bi-x-circle-fill input-icon-right" style={{ color: '#dc3545' }}></i>
              )}
            </div>
            {touched.email && errors.email
              ? <div className="field-error-msg"><i className="bi bi-exclamation-circle"></i> {errors.email}</div>
              : touched.email && !errors.email && form.email
                ? <div className="field-hint" style={{ color: '#1e7a3c' }}><i className="bi bi-check2 me-1"></i>Valid email format</div>
                : <div className="field-hint">Enter a valid email address (e.g. user@example.com)</div>
            }
          </div>

          <div className="form-group">
            <label className="sc-form-label">Password</label>
            <input
              className={fc('password')} type="password" name="password"
              placeholder="Minimum 6 characters"
              value={form.password} onChange={handleChange} onBlur={handleBlur}
            />
            {touched.password && errors.password && (
              <div className="field-error-msg"><i className="bi bi-exclamation-circle"></i> {errors.password}</div>
            )}
          </div>

          <div className="form-group">
            <label className="sc-form-label">Confirm Password</label>
            <input
              className={fc('confirm')} type="password" name="confirm"
              placeholder="Repeat your password"
              value={form.confirm} onChange={handleChange} onBlur={handleBlur}
            />
            {touched.confirm && errors.confirm && (
              <div className="field-error-msg"><i className="bi bi-exclamation-circle"></i> {errors.confirm}</div>
            )}
          </div>

          <button className="btn-sc-primary mt-1" type="submit" disabled={loading}>
            {loading
              ? <><div className="loader-ring" style={{ width: 18, height: 18, borderWidth: 2 }}></div> Creating account...</>
              : <><i className="bi bi-person-check"></i> Create Account</>}
          </button>
        </form>

        <div className="auth-link-row">
          Already have an account? <Link to="/student/login" className="auth-link">Sign in</Link>
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
