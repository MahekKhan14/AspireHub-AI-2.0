import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import '../styles/pages/AuthPages.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all fields');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/assessment');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#22c55e'];

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
            <h1 className="auth-title">Create your account</h1>
            <p className="auth-subtitle">Start your AI-powered career journey today</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" name="name" className="form-input" placeholder="Your full name"
                value={form.name} onChange={handleChange} disabled={loading} />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" name="email" className="form-input" placeholder="you@example.com"
                value={form.email} onChange={handleChange} disabled={loading} />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" name="password" className="form-input" placeholder="Min 6 characters"
                value={form.password} onChange={handleChange} disabled={loading} />
              {form.password && (
                <div className="auth-strength">
                  <div className="auth-strength__bars">
                    {[1,2,3].map(i => (
                      <div key={i} className="auth-strength__bar"
                        style={{ background: i <= strength ? strengthColor[strength] : 'var(--border)' }} />
                    ))}
                  </div>
                  <span style={{ color: strengthColor[strength], fontSize: '0.75rem' }}>{strengthLabel[strength]}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input type="password" name="confirm" className="form-input" placeholder="Repeat your password"
                value={form.confirm} onChange={handleChange} disabled={loading} />
              {form.confirm && form.password !== form.confirm && (
                <p className="auth-field-error">Passwords don't match</p>
              )}
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? (
                <><span className="btn-spinner"></span> Creating Account...</>
              ) : (
                <><span>🚀</span> Create Account Free</>
              )}
            </button>
          </form>

          <p className="auth-terms">
            By registering, you agree to our Terms of Service. Your data is never shared.
          </p>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
