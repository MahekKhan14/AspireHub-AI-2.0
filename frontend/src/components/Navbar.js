import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/components/Navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => setMenuOpen(false), [location]);

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = isAuthenticated
    ? [
        { to: '/dashboard',  label: 'Dashboard' },
        { to: '/assessment', label: 'Assessment' },
        { to: '/history',    label: 'History' },
        ...(user?.isAdmin ? [{ to: '/admin', label: '⚙️ Admin' }] : []),
      ]
    : [];

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        {/* Logo */}
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="navbar__logo">
          <div className="navbar__logo-mark">A</div>
          <span className="navbar__logo-name">
            AspireHub<span className="navbar__logo-ai">AI</span>
          </span>
        </Link>

        {/* Links */}
        <div className="navbar__links">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to}
              className={`navbar__link ${location.pathname === l.to ? 'active' : ''}`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="navbar__right">
          {isAuthenticated ? (
            <div className="navbar__user">
              <div className="navbar__avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
              <span className="navbar__user-name hide-mobile">{user?.name?.split(' ')[0]}</span>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">Logout</button>
            </div>
          ) : (
            <div className="navbar__auth">
              <Link to="/login"    className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}
          <button className={`navbar__burger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(p => !p)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="navbar__mobile">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} className="navbar__mobile-link">{l.label}</Link>
          ))}
          {isAuthenticated
            ? <button onClick={handleLogout} className="navbar__mobile-link navbar__mobile-logout">Logout</button>
            : <>
                <Link to="/login"    className="navbar__mobile-link">Login</Link>
                <Link to="/register" className="navbar__mobile-link navbar__mobile-cta">Get Started Free</Link>
              </>
          }
        </div>
      )}
    </nav>
  );
}
