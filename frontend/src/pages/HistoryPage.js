import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCareer } from '../context/CareerContext';
import '../styles/pages/HistoryPage.css';
import Footer from '../components/Footer';

export default function HistoryPage() {
  const { loadHistory } = useCareer();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const fetch = async () => {
      const data = await loadHistory();
      setAssessments(data);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="loading-screen"><div className="loader"></div></div>;

  return (
    <div className="history-page">
      <div className="history-container">
        <div className="history-header animate-fade-in">
          <span className="section-tag">ASSESSMENT HISTORY</span>
          <h1 className="history-title">Your Career <span className="gradient-text">Journey</span></h1>
          <p className="history-subtitle">Review all your past AI career assessments</p>
        </div>

        {assessments.length === 0 ? (
          <div className="history-empty animate-fade-in">
            <div className="history-empty__icon">📋</div>
            <h2>No assessments yet</h2>
            <p>Take your first AI assessment to see it here</p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/assessment')}>
              🧠 Start First Assessment
            </button>
          </div>
        ) : (
          <div className="history-grid">
            {assessments.map((item, i) => (
              <div key={i} className="history-card animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}
                onClick={() => navigate(`/results/${item._id}`)}>
                <div className="history-card__header">
                  <div className="history-card__date">
                    <div className="history-card__date-day">{new Date(item.createdAt).getDate()}</div>
                    <div className="history-card__date-month">{new Date(item.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</div>
                  </div>
                  <div className="history-card__careers-count">
                    {item.recommendations?.careers?.length || 0} careers
                  </div>
                </div>
                <div className="history-card__careers">
                  {item.recommendations?.careers?.slice(0, 3).map((c, j) => (
                    <div key={j} className="history-career-item">
                      <span>{['🥇','🥈','🥉'][j]}</span>
                      <span className="history-career-name">{c.title}</span>
                      {c.matchScore && <span className="history-career-score">{c.matchScore}%</span>}
                    </div>
                  ))}
                </div>
                <div className="history-card__footer">
                  <span>View full report →</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button className="btn btn-primary" onClick={() => navigate('/assessment')}>
            🧠 New Assessment
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
