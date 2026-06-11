import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../context/AuthContext';
import '../styles/pages/DashboardPage.css';
import Footer from '../components/Footer';

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/user/dashboard');
        setDashboard(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return (
    <div className="loading-screen">
      <div className="loader"></div>
    </div>
  );

  const { stats, recentAssessments } = dashboard || {};
  const userName = user?.name?.split(' ')[0] || 'Student';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? '🌅 Good morning' : hour < 17 ? '☀️ Good afternoon' : '🌙 Good evening';

  return (
    <div className="dashboard">
      <div className="dashboard-container">

        {/* Welcome Header */}
        <div className="dashboard-header animate-fade-in">
          <div className="dashboard-welcome">
            <span className="dashboard-greeting">{greeting},</span>
            <h1 className="dashboard-name">{userName}! 👋</h1>
            <p className="dashboard-subtitle">Ready to explore your next career opportunity?</p>
          </div>
          <Link to="/assessment" className="btn btn-primary btn-lg dashboard-cta">
            <span>🧠</span> New AI Assessment
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="dashboard-stats animate-fade-in stagger-1">
          <div className="dash-stat-card">
            <div className="dash-stat-card__icon" style={{ background: 'rgba(99,102,241,0.15)' }}>📊</div>
            <div>
              <div className="dash-stat-card__value">{stats?.totalAssessments || 0}</div>
              <div className="dash-stat-card__label">Assessments Taken</div>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-card__icon" style={{ background: 'rgba(34,211,238,0.15)' }}>🎯</div>
            <div>
              <div className="dash-stat-card__value">{stats?.topCareers?.length || 0}</div>
              <div className="dash-stat-card__label">Careers Matched</div>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-card__icon" style={{ background: 'rgba(163,230,53,0.15)' }}>📅</div>
            <div>
              <div className="dash-stat-card__value">
                {stats?.lastAssessmentDate ? new Date(stats.lastAssessmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Never'}
              </div>
              <div className="dash-stat-card__label">Last Assessment</div>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-card__icon" style={{ background: 'rgba(249,115,22,0.15)' }}>🤖</div>
            <div>
              <div className="dash-stat-card__value">Active</div>
              <div className="dash-stat-card__label">AspireBot Status</div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Top Careers */}
          <div className="dash-card animate-fade-in stagger-2">
            <div className="dash-card__header">
              <h2 className="dash-card__title">🏆 Your Top Career Matches</h2>
              {stats?.totalAssessments > 0 && (
                <Link to="/history" className="dash-card__link">View all →</Link>
              )}
            </div>

            {stats?.topCareers?.length > 0 ? (
              <div className="top-careers">
                {stats.topCareers.map((career, i) => (
                  <div key={i} className="top-career-item">
                    <div className="top-career-rank">{['🥇', '🥈', '🥉'][i]}</div>
                    <div className="top-career-info">
                      <div className="top-career-name">{career.title}</div>
                      <div className="top-career-field">{career.field}</div>
                    </div>
                    <div className="top-career-score">
                      <div className="top-career-score__bar">
                        <div style={{ width: `${career.matchScore}%`, background: ['#fbbf24','#94a3b8','#fb923c'][i] }}></div>
                      </div>
                      <span>{career.matchScore}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dash-empty">
                <div className="dash-empty__icon">🎯</div>
                <h3>No assessments yet</h3>
                <p>Take your first AI assessment to discover your perfect career matches</p>
                <Link to="/assessment" className="btn btn-primary">
                  Start Assessment
                </Link>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="dash-card animate-fade-in stagger-3">
            <div className="dash-card__header">
              <h2 className="dash-card__title">📋 Recent Assessments</h2>
            </div>

            {recentAssessments?.length > 0 ? (
              <div className="recent-list">
                {recentAssessments.map((item, i) => (
                  <div key={i} className="recent-item" onClick={() => navigate(`/results/${item.id}`)}>
                    <div className="recent-item__icon">📊</div>
                    <div className="recent-item__info">
                      <div className="recent-item__title">{item.topCareer || 'Career Analysis'}</div>
                      <div className="recent-item__date">{new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <div className="recent-item__arrow">→</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dash-empty">
                <div className="dash-empty__icon">📋</div>
                <h3>No history yet</h3>
                <p>Your past assessments will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions animate-fade-in stagger-4">
          <h2 className="quick-actions__title">⚡ Quick Actions</h2>
          <div className="quick-actions__grid">
            {[
              { icon: '🧠', title: 'New Assessment', desc: 'Get fresh AI career recommendations', to: '/assessment', variant: 'primary' },
              { icon: '📋', title: 'View History', desc: 'Review your past career analyses', to: '/history', variant: 'outline' },
              { icon: '🤖', title: 'Ask AspireBot', desc: 'Chat with AI for career advice', action: 'chatbot', variant: 'outline' },
            ].map((action, i) => (
              action.to ? (
                <Link key={i} to={action.to} className={`quick-action-card quick-action-card--${action.variant}`}>
                  <span className="quick-action-card__icon">{action.icon}</span>
                  <div>
                    <div className="quick-action-card__title">{action.title}</div>
                    <div className="quick-action-card__desc">{action.desc}</div>
                  </div>
                </Link>
              ) : (
                <div key={i} className={`quick-action-card quick-action-card--${action.variant}`}
                  onClick={() => window.dispatchEvent(new CustomEvent('openChatbot'))}>
                  <span className="quick-action-card__icon">{action.icon}</span>
                  <div>
                    <div className="quick-action-card__title">{action.title}</div>
                    <div className="quick-action-card__desc">{action.desc}</div>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
