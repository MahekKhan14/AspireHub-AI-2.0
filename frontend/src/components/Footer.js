import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <div className="footer__logo">
              <div className="footer__logo-mark">A</div>
              <span className="footer__logo-name">AspireHub<span className="footer__logo-ai">AI</span></span>
            </div>
            <p className="footer__desc">
              AI-powered career counselling covering every career field in the world — from tech to culinary arts, music to medicine, fashion to finance.
            </p>
          </div>
          <div className="footer__cols">
            <div className="footer__col">
              <h4>Platform</h4>
              <ul>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/assessment">AI Assessment</Link></li>
                <li><Link to="/history">History</Link></li>
              </ul>
            </div>
            <div className="footer__col">
              <h4>Support</h4>
              <ul>
                <li><span className="footer__col-link">Privacy Policy</span></li>
                <li><span className="footer__col-link">Terms of Use</span></li>
                <li><span className="footer__col-link">Help</span></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} AspireHub-AI Career Counselling System</span>
          <span className="footer__credit">Crafted with ♥ by <strong>Mahek</strong></span>
        </div>
      </div>
    </footer>
  );
}
