import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import '../styles/pages/AuthPages.css';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg__orb auth-bg__orb--1"></div>
        <div className="auth-bg__orb auth-bg__orb--2"></div>
      </div>

      <div className="auth-container">
        <div className="auth-card animate-fade-in">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <div className="auth-logo__icon">AI</div>
              <span>AspireHub-AI</span>
            </Link>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to your career dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email" name="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="auth-password-wrap">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  placeholder="Your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? (
                <><span className="btn-spinner"></span> Signing in...</>
              ) : (
                <><span>🔐</span> Sign In</>
              )}
            </button>
          </form>

          <div className="auth-divider"><span>OR</span></div>

          <div className="auth-demo">
            <p className="auth-demo__label">Try with demo credentials:</p>
            <button
              type="button"
              className="btn btn-outline w-full"
              onClick={() => {
                setForm({ email: 'demo@careerai.com', password: 'demo123' });
                toast('Demo credentials filled!', { icon: '💡' });
              }}
            >
              Use Demo Account
            </button>
          </div>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
