import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, LineChart, Line, CartesianGrid, 
  
} from 'recharts';
import '../styles/pages/AdminPage.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e', '#ec4899', '#14b8a6'];
const PRIORITY_COLORS = { High: '#f43f5e', Medium: '#f59e0b', Low: '#10b981' };

// ── Helpers ──────────────────────────────────────────────────────────────────
const fetchAdmin = async (endpoint, token) => {
  const authToken = token || localStorage.getItem('careerai_token');
  const res = await fetch(`${API}/admin/${endpoint}`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

// ── Sub-components ────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="admin-stat-card" style={{ '--accent': color }}>
      <div className="admin-stat-icon">{icon}</div>
      <div className="admin-stat-body">
        <div className="admin-stat-value">{value}</div>
        <div className="admin-stat-label">{label}</div>
        {sub && <div className="admin-stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

function SkillGapBar({ skill, gapPercent, have, missing }) {
  return (
    <div className="skill-gap-row">
      <div className="skill-gap-label">{skill}</div>
      <div className="skill-gap-track">
        <div
          className="skill-gap-fill"
          style={{
            width: `${100 - gapPercent}%`,
            background: gapPercent > 70 ? '#f43f5e' : gapPercent > 40 ? '#f59e0b' : '#10b981'
          }}
        />
      </div>
      <div className="skill-gap-stats">
        <span className="have">{have} have</span>
        <span className="missing">{missing} lack</span>
        <span className="gap-pct" style={{ color: gapPercent > 70 ? '#f43f5e' : gapPercent > 40 ? '#f59e0b' : '#10b981' }}>
          {gapPercent}% gap
        </span>
      </div>
    </div>
  );
}

function DomainCoverageCard({ domain, avgCoverage, gap, missingTop, emerging }) {
  const color = avgCoverage >= 70 ? '#10b981' : avgCoverage >= 40 ? '#f59e0b' : '#f43f5e';
  return (
    <div className="domain-card">
      <div className="domain-card__header">
        <div className="domain-card__title">{domain}</div>
        <div className="domain-coverage" style={{ color }}>
          <div className="domain-coverage__ring" style={{ '--pct': avgCoverage, '--color': color }}>
            <svg viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="4" />
              <circle cx="25" cy="25" r="20" fill="none" stroke={color}
                strokeWidth="4"
                strokeDasharray={`${avgCoverage * 1.257} 125.7`}
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
              />
            </svg>
            <span>{avgCoverage}%</span>
          </div>
        </div>
      </div>
      {missingTop.length > 0 && (
        <div className="domain-card__missing">
          <span className="label">Top Missing:</span>
          {missingTop.map((s, i) => <span key={i} className="missing-tag">{s}</span>)}
        </div>
      )}
      {emerging.length > 0 && (
        <div className="domain-card__emerging">
          <span className="label">Emerging Needs:</span>
          {emerging.slice(0, 2).map((s, i) => <span key={i} className="emerging-tag">{s}</span>)}
        </div>
      )}
    </div>
  );
}

function SyllabusCard({ rec }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`syllabus-card priority-${rec.priority.toLowerCase()}`}>
      <div className="syllabus-card__header" onClick={() => setExpanded(!expanded)}>
        <div className="syllabus-left">
          <span className="priority-badge" style={{ background: PRIORITY_COLORS[rec.priority] }}>
            {rec.priority} Priority
          </span>
          <h4>{rec.domain}</h4>
        </div>
        <div className="syllabus-expand">{expanded ? '▲' : '▼'}</div>
      </div>
      <p className="syllabus-rec">{rec.recommendation}</p>
      {expanded && (
        <div className="syllabus-details">
          {rec.missingRequired.length > 0 && (
            <div className="syllabus-section">
              <div className="syllabus-section__title">Missing Core Skills</div>
              <div className="skill-tags">
                {rec.missingRequired.map((s, i) => <span key={i} className="skill-tag required">{s}</span>)}
              </div>
            </div>
          )}
          {rec.missingEmerging.length > 0 && (
            <div className="syllabus-section">
              <div className="syllabus-section__title">Missing Emerging Skills</div>
              <div className="skill-tags">
                {rec.missingEmerging.map((s, i) => <span key={i} className="skill-tag emerging">{s}</span>)}
              </div>
            </div>
          )}
          <div className="syllabus-section">
            <div className="syllabus-section__title">Action Items</div>
            <ul className="action-list">
              {rec.actionItems.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function StudentRow({ student }) {
  const scoreColor = student.skillScore >= 60 ? '#10b981' : student.skillScore >= 35 ? '#f59e0b' : '#f43f5e';
  return (
    <tr className="student-row">
      <td>
        <div className="student-name-cell">
          <div className="student-avatar">{student.name?.charAt(0)?.toUpperCase()}</div>
          <div>
            <div className="student-name">{student.name}</div>
            <div className="student-email">{student.email}</div>
          </div>
        </div>
      </td>
      <td>{student.stream}</td>
      <td>
        <div className="skill-score-cell">
          <div className="skill-score-bar">
            <div style={{ width: `${student.skillScore}%`, background: scoreColor, height: '100%', borderRadius: 4, transition: 'width 0.8s' }} />
          </div>
          <span style={{ color: scoreColor, fontWeight: 600 }}>{student.skillScore}%</span>
        </div>
      </td>
      <td>{student.assessmentsTaken || 0}</td>
      <td>{student.topCareer || '—'}</td>
      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        {student.lastAssessment ? new Date(student.lastAssessment).toLocaleDateString() : 'Never'}
      </td>
    </tr>
  );
}

// ── Main Admin Page ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem('careerai_token');

  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState(null);
  const [syllabus, setSyllabus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [sortBy, setSortBy] = useState('skillScore');
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async (endpoint, setter) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdmin(endpoint, token);
      setter(data);
    } catch (e) {
      if (e.message.includes('403')) {
        setError('Admin access required. Only the first registered user or users with "admin" in their email can access this page.');
      } else if (e.message.includes('401')) {
        setError('Session expired. Please login again.');
      } else if (e.message.includes('404') || e.message.includes('Failed to fetch')) {
        setError('Backend server not reachable. Please start the backend server: cd backend && npm start');
      } else {
        setError(`Error: ${e.message}. Make sure backend is running on port 5000.`);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === 'overview' && !overview) load('overview', setOverview);
    if (activeTab === 'analytics' && !analytics) load('skill-analytics', setAnalytics);
    if (activeTab === 'students' && !students) load('students', setStudents);
    if (activeTab === 'syllabus' && !syllabus) load('syllabus-recommendations', setSyllabus);
  }, [activeTab, overview, analytics, students, syllabus, load]);

  const filteredStudents = (students?.students || []).filter(s => {
    const q = searchQuery.toLowerCase();
    return s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.stream?.toLowerCase().includes(q);
  }).sort((a, b) => {
    if (sortBy === 'skillScore') return b.skillScore - a.skillScore;
    if (sortBy === 'assessments') return b.assessmentsTaken - a.assessmentsTaken;
    if (sortBy === 'name') return a.name?.localeCompare(b.name);
    return 0;
  });

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Stream', 'Industry Skill Score (%)', 'Assessments Taken', 'Top Career Match', 'Last Active'];
    const rows = filteredStudents.map(s => [
      s.name || '',
      s.email || '',
      s.stream || 'N/A',
      s.skillScore ?? 0,
      s.assessmentsTaken ?? 0,
      s.topCareer || '—',
      s.lastAssessment ? new Date(s.lastAssessment).toLocaleDateString() : 'Never'
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `students_report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAISync = async () => {
    if (!window.confirm('This will use AI to research and update industry standards for all domains. This may take a minute. Continue?')) return;
    
    setSyncing(true);
    try {
      const res = await fetch(`${API}/admin/sync-standards`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sync failed');
      
      alert('✅ Industry standards updated successfully via AI!');
      // Reload analytics if on that tab
      if (activeTab === 'analytics') load('skill-analytics', setAnalytics);
      if (activeTab === 'syllabus') load('syllabus-recommendations', setSyllabus);
    } catch (e) {
      alert(`❌ Sync failed: ${e.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'analytics', label: 'Skill Analytics', icon: '🔬' },
    { id: 'students', label: 'Students', icon: '🎓' },
    { id: 'syllabus', label: 'Syllabus Recommendations', icon: '📚' },
  ];

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header__content">
          <div className="admin-header__left">
            <div className="admin-badge">Institute Dashboard</div>
            <h1>Skills Intelligence Center</h1>
            <p>Real-time analytics on student skills, industry gaps, and curriculum recommendations</p>
          </div>
          <div className="admin-header__right">
            <button 
              className={`ai-sync-btn ${syncing ? 'syncing' : ''}`} 
              onClick={handleAISync}
              disabled={syncing}
            >
              <span>{syncing ? '⌛' : '✨'}</span>
              {syncing ? 'AI Syncing...' : 'Sync Standards with AI'}
            </button>
            <div className="live-indicator">
              <span className="live-dot"></span> Live Data
            </div>
          </div>
        </div>
        <div className="admin-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-content">
        {error && (
          <div className="admin-error">
            <span>⚠️</span>
            <div>
              <strong>Access Error</strong>
              <p>{error}</p>
            </div>
            <button onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
          </div>
        )}

        {loading && (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p>Loading analytics data...</p>
          </div>
        )}

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && !loading && overview && (
          <div className="tab-content">
            <div className="stats-grid">
              <StatCard icon="👥" label="Total Students" value={overview.totalUsers} color="#3b82f6" sub="Registered users" />
              <StatCard icon="📋" label="Assessments Done" value={overview.totalAssessments} color="#10b981" sub="Completed career analyses" />
              <StatCard icon="📅" label="This Month" value={overview.recentCount} color="#f59e0b" sub="New assessments (30 days)" />
              <StatCard icon="🎯" label="Avg per Student" value={overview.totalUsers > 0 ? (overview.totalAssessments / overview.totalUsers).toFixed(1) : 0} color="#8b5cf6" sub="Assessments per user" />
            </div>

            <div className="two-col">
              <div className="admin-card">
                <div className="admin-card__header">
                  <h3>Recent Activity</h3>
                </div>
                <div className="activity-list">
                  {(overview.recentAssessments || []).map((a, i) => (
                    <div key={i} className="activity-item">
                      <div className="activity-avatar">{a.userId?.name?.charAt(0)?.toUpperCase() || '?'}</div>
                      <div className="activity-info">
                        <div className="activity-name">{a.userId?.name || 'Unknown'}</div>
                        <div className="activity-meta">
                          Completed career assessment • {new Date(a.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="activity-careers">
                        {(a.recommendations?.careers || []).slice(0, 2).map((c, j) => (
                          <span key={j} className="mini-badge">{c.title?.split(' ').slice(0, 2).join(' ')}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {!(overview.recentAssessments?.length) && (
                    <div className="empty-state">No assessments yet. Students need to complete assessments first.</div>
                  )}
                </div>
              </div>

              <div className="admin-card">
                <div className="admin-card__header">
                  <h3>Quick Insights</h3>
                </div>
                <div className="insights-list">
                  <div className="insight-item insight-blue">
                    <div className="insight-icon">📈</div>
                    <div>
                      <strong>Engagement Rate</strong>
                      <p>
                        {overview.totalUsers > 0
                          ? `${Math.round((overview.recentCount / overview.totalUsers) * 100)}% of students assessed in last 30 days`
                          : 'No data yet'}
                      </p>
                    </div>
                  </div>
                  <div className="insight-item insight-green">
                    <div className="insight-icon">🎓</div>
                    <div>
                      <strong>Platform Health</strong>
                      <p>System operational. AI recommendations active.</p>
                    </div>
                  </div>
                  <div className="insight-item insight-amber">
                    <div className="insight-icon">⚠️</div>
                    <div>
                      <strong>Action Needed</strong>
                      <p>View Skill Analytics tab to identify curriculum gaps.</p>
                    </div>
                  </div>
                  <div className="insight-item insight-purple">
                    <div className="insight-icon">🔮</div>
                    <div>
                      <strong>Next Step</strong>
                      <p>Check Syllabus Recommendations to update course offerings.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {activeTab === 'analytics' && !loading && analytics && (
          <div className="tab-content">
            <div className="analytics-intro">
              <span className="analytics-count">Based on {analytics.totalAnalyzed} student assessments</span>
              <select className="domain-filter" value={selectedDomain} onChange={e => setSelectedDomain(e.target.value)}>
                <option value="all">All Domains</option>
                {(analytics.domainGaps || []).map(d => <option key={d.domain} value={d.domain}>{d.domain}</option>)}
              </select>
            </div>

            {analytics.totalAnalyzed === 0 ? (
              <div className="empty-analytics">
                <div className="empty-analytics__icon">📭</div>
                <h3>No Assessment Data Yet</h3>
                <p>Students need to complete career assessments before analytics can be generated. Share the platform with your students!</p>
              </div>
            ) : (
              <>
                {/* Domain Coverage Grid */}
                <div className="section-title">
                  <h2>Industry Domain Coverage</h2>
                  <p>Average skill coverage of students against industry standards per domain</p>
                </div>
                <div className="domain-grid">
                  {(analytics.domainGaps || [])
                    .filter(d => selectedDomain === 'all' || d.domain === selectedDomain)
                    .map((d, i) => <DomainCoverageCard key={i} {...d} />)}
                </div>

                {/* Skill Gap Analysis */}
                <div className="section-title">
                  <h2>Critical Skill Gaps</h2>
                  <p>Industry-required skills that most students are missing</p>
                </div>
                <div className="admin-card">
                  <div className="skill-gaps-list">
                    {(analytics.skillGaps || []).map((gap, i) => (
                      <SkillGapBar key={i} {...gap} />
                    ))}
                    {!analytics.skillGaps?.length && <div className="empty-state">No significant gaps detected — students are well-covered!</div>}
                  </div>
                </div>

                {/* Charts Row */}
                <div className="charts-row">
                  {/* Skills Students Have */}
                  <div className="admin-card chart-card">
                    <div className="admin-card__header">
                      <h3>Top Skills Students Have</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={analytics.skillFrequency?.slice(0, 10)} layout="vertical" margin={{ left: 30 }}>
                        <XAxis type="number" tick={{ fill: '#8fafc8', fontSize: 11 }} />
                        <YAxis dataKey="skill" type="category" tick={{ fill: '#4b6b8e', fontSize: 11 }} width={90} />
                        <Tooltip
                          contentStyle={{ background: '#fff', border: '1px solid #e1effd', borderRadius: 8 }}
                          formatter={(v) => [`${v} students`]}
                        />
                        <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                          {(analytics.skillFrequency?.slice(0, 10) || []).map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Career Distribution */}
                  <div className="admin-card chart-card">
                    <div className="admin-card__header">
                      <h3>Career Field Distribution</h3>
                    </div>
                    {analytics.careerDistribution?.length > 0 ? (
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie
                            data={analytics.careerDistribution}
                            dataKey="count"
                            nameKey="field"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            label={({ field, percent }) => `${field.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {(analytics.careerDistribution || []).map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e1effd', borderRadius: 8 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : <div className="empty-state">No career data yet</div>}
                  </div>
                </div>

                {/* Monthly Trend */}
                {analytics.trendData?.length > 1 && (
                  <div className="admin-card">
                    <div className="admin-card__header">
                      <h3>Assessment Trend (Last 6 Months)</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={analytics.trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.1)" />
                        <XAxis dataKey="month" tick={{ fill: '#8fafc8', fontSize: 11 }} />
                        <YAxis tick={{ fill: '#8fafc8', fontSize: 11 }} />
                        <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e1effd', borderRadius: 8 }} />
                        <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Industry Standards Reference */}
                <div className="section-title">
                  <h2>Industry Standards Reference</h2>
                  <p>What industry requires for each career domain (use this to update curriculum)</p>
                </div>
                <div className="standards-grid">
                  {Object.entries(analytics.industryStandards || {})
                    .filter(([d]) => selectedDomain === 'all' || d === selectedDomain)
                    .map(([domain, skills]) => (
                      <div key={domain} className="standards-card">
                        <h4>{domain}</h4>
                        <div className="standards-section">
                          <div className="standards-label required-label">Core Required</div>
                          <div className="skill-tags">
                            {skills.required.map((s, i) => <span key={i} className="skill-tag required">{s}</span>)}
                          </div>
                        </div>
                        <div className="standards-section">
                          <div className="standards-label emerging-label">Emerging</div>
                          <div className="skill-tags">
                            {skills.emerging.map((s, i) => <span key={i} className="skill-tag emerging">{s}</span>)}
                          </div>
                        </div>
                        <div className="standards-section">
                          <div className="standards-label nice-label">Nice to Have</div>
                          <div className="skill-tags">
                            {skills.nice.map((s, i) => <span key={i} className="skill-tag nice">{s}</span>)}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── STUDENTS TAB ── */}
        {activeTab === 'students' && !loading && students && (
          <div className="tab-content">
            <div className="students-toolbar">
              <div className="search-box">
                <span>🔍</span>
                <input
                  type="text"
                  placeholder="Search by name, email, or stream..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="skillScore">Sort: Skill Score</option>
                <option value="assessments">Sort: Assessments</option>
                <option value="name">Sort: Name</option>
              </select>
              <div className="students-count">
                {filteredStudents.length} of {students.students?.length} students
              </div>
              <button
                className="csv-export-btn"
                onClick={exportToCSV}
                disabled={filteredStudents.length === 0}
                title="Download student data as CSV"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Export CSV
              </button>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="empty-state" style={{ padding: '3rem', textAlign: 'center' }}>
                {searchQuery ? 'No students match your search.' : 'No students registered yet.'}
              </div>
            ) : (
              <div className="admin-card">
                <div className="table-wrapper">
                  <table className="students-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Stream</th>
                        <th>Industry Skill Score</th>
                        <th>Assessments</th>
                        <th>Top Career Match</th>
                        <th>Last Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((s, i) => <StudentRow key={i} student={s} />)}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Skill score legend */}
            <div className="score-legend">
              <div className="legend-item"><span className="dot green"></span> 60–100% Industry Ready</div>
              <div className="legend-item"><span className="dot amber"></span> 35–59% Needs Improvement</div>
              <div className="legend-item"><span className="dot red"></span> 0–34% Significant Gap</div>
            </div>
          </div>
        )}

        {/* ── SYLLABUS TAB ── */}
        {activeTab === 'syllabus' && !loading && syllabus && (
          <div className="tab-content">
            <div className="syllabus-intro">
              <div className="syllabus-intro__icon">Curriculum</div>
              <div>
                <h2>Curriculum Improvement Recommendations</h2>
                <p>Based on skill gap analysis, here's what your institution should add or update in its curriculum to ensure industry readiness.</p>
              </div>
            </div>

            <div className="priority-legend">
              <span style={{ color: '#f43f5e' }}>High Priority — Immediate action needed</span>
              <span style={{ color: '#f59e0b' }}>Medium Priority — Plan for next semester</span>
              <span style={{ color: '#10b981' }}>Low Priority — Optional enhancement</span>
            </div>

            <div className="syllabus-list">
              {(syllabus.syllabusRecommendations || []).map((rec, i) => (
                <SyllabusCard key={i} rec={rec} />
              ))}
            </div>

            {/* Export summary */}
            <div className="admin-card export-card">
              <h3>How to Use These Recommendations</h3>
              <div className="export-steps">
                <div className="export-step">
                  <div className="step-num">1</div>
                  <div>
                    <strong>Identify High Priority items</strong>
                    <p>Start with High Priority domains — these represent the biggest gaps between what students know and what industry requires.</p>
                  </div>
                </div>
                <div className="export-step">
                  <div className="step-num">2</div>
                  <div>
                    <strong>Update Core Curriculum</strong>
                    <p>Add missing required skills as mandatory subjects or modules in existing courses.</p>
                  </div>
                </div>
                <div className="export-step">
                  <div className="step-num">3</div>
                  <div>
                    <strong>Add Electives/Workshops</strong>
                    <p>Emerging skills are best covered through short workshops, guest lectures, or optional electives.</p>
                  </div>
                </div>
                <div className="export-step">
                  <div className="step-num">4</div>
                  <div>
                    <strong>Re-assess Periodically</strong>
                    <p>As more students take assessments, the analytics will become more accurate. Review every semester.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty state when no data loaded */}
        {!loading && !error && !overview && !analytics && !students && !syllabus && (
          <div className="empty-state" style={{ padding: '4rem', textAlign: 'center' }}>
            <p>Select a tab above to view data.</p>
          </div>
        )}
      </div>
    </div>
  );
}
