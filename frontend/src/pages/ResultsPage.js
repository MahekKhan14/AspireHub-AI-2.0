import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCareer } from '../context/CareerContext';
import { api } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import '../styles/pages/ResultsPage.css';
import Footer from '../components/Footer';

const MEDAL = ['🥇', '🥈', '🥉'];
const RANK_COLORS = ['#F59E0B', '#94a3b8', '#fb923c'];

/* ── Salary Chart (original) ─────────────────────────────── */
function SalaryChart({ salaryData }) {
  const data = [
    { name: 'Entry\n0-2yr',   salary: parseInt(salaryData.entry?.range?.replace(/[^0-9]/g,'').slice(0,2)||'4'),   range: salaryData.entry?.range },
    { name: 'Mid\n2-5yr',     salary: parseInt(salaryData.mid?.range?.replace(/[^0-9]/g,'').slice(0,2)||'10'),   range: salaryData.mid?.range },
    { name: 'Senior\n5-10yr', salary: parseInt(salaryData.senior?.range?.replace(/[^0-9]/g,'').slice(0,2)||'25'), range: salaryData.senior?.range },
    { name: 'Expert\n10+yr',  salary: parseInt(salaryData.expert?.range?.replace(/[^0-9]/g,'').slice(0,2)||'50'), range: salaryData.expert?.range },
  ];
  return (
    <div className="salary-chart">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top:5, right:5, left:-20, bottom:5 }}>
          <XAxis dataKey="name" tick={{ fill:'#64748b', fontSize:11 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip
            contentStyle={{ background:'#0F172A', border:'1px solid #334155', borderRadius:'8px', color:'#f1f5f9', fontSize:'0.8rem' }}
            formatter={(v,n,p) => [p.payload.range,'Salary']}
            labelStyle={{ color:'#F59E0B' }}
          />
          <Bar dataKey="salary" radius={[6,6,0,0]}>
            {data.map((_,i) => <Cell key={i} fill={`rgba(245,158,11,${0.35+i*0.16})`} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── AI Action Plan ───────────────────────────────────────── */
function ActionPlan({ career, profile }) {
  const [plan, setPlan]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const generate = async () => {
    if (loading) return;
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/career/action-plan', {
        careerTitle: career.title,
        skills: career.skills?.required || [],
        missingSkills: career.skillGapAnalysis?.missingSkills || [],
        goal: profile?.goal || '',
      });
      setPlan(data.plan);
    } catch (e) {
      const msg = e.response?.status === 429
        ? 'Gemini is busy right now. Please wait 10 seconds and try again.'
        : 'Failed to generate plan. Please try again.';
      setError(msg);
    }
    finally { setLoading(false); }
  };
  if (!plan) return (
    <div className="feature-prompt">
      <div className="feature-prompt__icon">📅</div>
      <div><h4>AI 7-Day Action Plan</h4><p>Get a personalised day-by-day starter plan for {career.title}</p></div>
      {error && <p className="feature-error" style={{maxWidth:'320px',textAlign:'center'}}>{error}</p>}
      <button className="btn btn-primary" onClick={generate} disabled={loading}>
        {loading ? <><span className="btn-spinner"/> Generating (may take 10s)...</> : '✨ Generate My Plan'}
      </button>
    </div>
  );
  return (
    <div>
      <h4 className="action-plan__title">Your 7-Day Starter Plan — {career.title}</h4>
      <div className="action-plan__days">
        {plan.map((day,i) => (
          <div key={i} className="action-day">
            <div className="action-day__label">Day {day.day}</div>
            <div>
              <div className="action-day__focus">{day.focus}</div>
              <ul className="action-day__tasks">{day.tasks?.map((t,j) => <li key={j}>{t}</li>)}</ul>
              {day.resource && <div className="action-day__resource">📚 {day.resource}</div>}
            </div>
          </div>
        ))}
      </div>
      <button className="btn btn-outline btn-sm" style={{marginTop:'1rem'}} onClick={()=>setPlan(null)}>🔄 Regenerate</button>
    </div>
  );
}

/* ── Resume Analyzer ──────────────────────────────────────── */
function ResumeAnalyzer({ career }) {
  const [text, setText]         = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const analyze = async () => {
    if (!text.trim()) return;
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/career/analyze-resume', { resumeText: text, careerTitle: career.title, requiredSkills: career.skills?.required||[] });
      setAnalysis(data.analysis);
    } catch (e) {
      setError(e.response?.status === 429
        ? 'Gemini is busy. Wait 10 seconds and try again.'
        : 'Analysis failed. Please try again.');
    }
    finally { setLoading(false); }
  };
  if (!analysis) return (
    <div className="resume-analyzer">
      <div className="feature-prompt">
        <div className="feature-prompt__icon">📄</div>
        <div><h4>AI Resume Analyzer</h4><p>Paste your resume — AI scores it against {career.title} requirements</p></div>
      </div>
      <textarea className="form-input" rows={8} placeholder="Paste your resume text here..." value={text} onChange={e=>setText(e.target.value)} />
      {error && <p className="feature-error">{error}</p>}
      <button className="btn btn-primary" onClick={analyze} disabled={loading||!text.trim()}>
        {loading ? <><span className="btn-spinner"/> Analysing...</> : '🔍 Analyse My Resume'}
      </button>
    </div>
  );
  return (
    <div>
      <div className="resume-score-row">
        <div>
          <div className="resume-score__value" style={{color:analysis.score>=70?'#10B981':analysis.score>=40?'#F59E0B':'#EF4444'}}>{analysis.score}<span>/100</span></div>
          <div className="resume-score__label">Match Score</div>
        </div>
        <p className="resume-result__summary">{analysis.summary}</p>
      </div>
      <div className="resume-grid">
        <div className="resume-section"><h5>✅ Matched Skills</h5><div className="skill-tags">{analysis.matched?.map((s,i)=><span key={i} className="skill-tag skill-tag--success">{s}</span>)}</div></div>
        <div className="resume-section"><h5>🚀 Missing Skills</h5><div className="skill-tags">{analysis.missing?.map((s,i)=><span key={i} className="skill-tag skill-tag--warning">{s}</span>)}</div></div>
      </div>
      <div className="resume-tips"><h5>💡 What to add to your resume</h5><ul>{analysis.tips?.map((t,i)=><li key={i}>{t}</li>)}</ul></div>
      <button className="btn btn-outline btn-sm" style={{marginTop:'1rem'}} onClick={()=>{setAnalysis(null);setText('');}}>🔄 Analyse Another</button>
    </div>
  );
}

/* ── Mock Interview ───────────────────────────────────────── */
function MockInterview({ career }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers]     = useState({});
  const [results, setResults]     = useState(null);
  const [current, setCurrent]     = useState(0);
  const [loading, setLoading]     = useState(false);
  const [scoring, setScoring]     = useState(false);
  const [error, setError]         = useState('');
  const start = async () => {
    if (loading) return;
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/career/mock-interview', { careerTitle: career.title });
      setQuestions(data.questions); setAnswers({}); setResults(null); setCurrent(0);
    } catch (e) {
      const msg = e.response?.status === 429
        ? 'Gemini is busy right now. Please wait 10 seconds and try again.'
        : 'Failed to generate questions. Please try again.';
      setError(msg);
    }
    finally { setLoading(false); }
  };
  const submit = async () => {
    setScoring(true);
    try {
      const { data } = await api.post('/career/score-interview', {
        careerTitle: career.title,
        qa: questions.map((q,i)=>({ question:q, answer:answers[i]||'' })),
      });
      setResults(data.results);
    } catch { setError('Scoring failed. Please try again.'); }
    finally { setScoring(false); }
  };
  if (!questions.length) return (
    <div className="feature-prompt">
      <div className="feature-prompt__icon">🎙️</div>
      <div><h4>AI Mock Interview</h4><p>Practice 5 real interview questions for {career.title} — AI scores each answer</p></div>
      {error && <p className="feature-error">{error}</p>}
      <button className="btn btn-primary" onClick={start} disabled={loading}>
        {loading ? <><span className="btn-spinner"/> Preparing...</> : '🎙️ Start Mock Interview'}
      </button>
    </div>
  );
  if (results) {
    const avg = Math.round(results.reduce((s,r)=>s+r.score,0)/results.length);
    return (
      <div>
        <div className={`interview-total ${avg>=70?'good':avg>=40?'ok':'low'}`}>
          <span className="interview-total__score">{avg}/100</span>
          <span className="interview-total__label">{avg>=70?'Excellent!':avg>=40?'Keep studying!':'Review the notes!'}</span>
        </div>
        {results.map((r,i) => (
          <div key={i} className="interview-qa">
            <div className="interview-qa__q">Q{i+1}. {questions[i]}</div>
            <div className="interview-qa__a"><strong>Your answer:</strong> {answers[i]||'(no answer)'}</div>
            <div className="interview-qa__score" style={{color:r.score>=70?'#10B981':r.score>=40?'#F59E0B':'#EF4444'}}>Score: {r.score}/100</div>
            <div className="interview-qa__feedback">{r.feedback}</div>
          </div>
        ))}
        <button className="btn btn-outline btn-sm" style={{marginTop:'1rem'}} onClick={()=>{setQuestions([]);setResults(null);}}>🔄 Try Again</button>
      </div>
    );
  }
  const isMeaningful = (ans) => ans && ans.trim().replace(/[. \t\n…]/g,'').length >= 8;
  const allAnswered = questions.every((_,i) => isMeaningful(answers[i]));
  const answeredCount = questions.filter((_,i) => isMeaningful(answers[i])).length;
  return (
    <div>
      <div className="interview-progress">
        {questions.map((_,i)=>(
          <div key={i} className={`interview-progress__dot ${i===current?'active':answers[i]?'done':''}`} onClick={()=>setCurrent(i)} />
        ))}
        <span style={{fontSize:'12px',color:'var(--text-muted)',marginLeft:'8px'}}>{current+1}/{questions.length}</span>
      </div>
      <div className="interview-question">
        <span className="interview-question__num">Question {current+1}</span>
        <p>{questions[current]}</p>
      </div>
      <textarea className="form-input" rows={5} placeholder="Type your answer here..."
        value={answers[current]||''} onChange={e=>setAnswers(p=>({...p,[current]:e.target.value}))} />
      <div style={{display:'flex',gap:'10px',marginTop:'1rem',justifyContent:'space-between',flexWrap:'wrap'}}>
        <button className="btn btn-outline btn-sm" onClick={()=>setCurrent(p=>Math.max(0,p-1))} disabled={current===0}>← Prev</button>
        {current<questions.length-1
          ? <button className="btn btn-primary btn-sm" onClick={()=>setCurrent(p=>p+1)}>Next →</button>
          : <button className="btn btn-accent" onClick={submit} disabled={!allAnswered||scoring}>
              {scoring ? <><span className="btn-spinner"/> Scoring...</> : `📊 Submit & Get Score (${answeredCount}/${questions.length} answered)`}
            </button>
        }
      </div>
      {error && <p className="feature-error" style={{marginTop:'8px'}}>{error}</p>}
    </div>
  );
}

/* ── Career Comparison ────────────────────────────────────── */
function CareerComparison({ careers }) {
  const [sel, setSel] = useState([0,1]);
  if (careers.length < 2) return <p style={{color:'var(--text-muted)',fontSize:'14px'}}>Need at least 2 career matches to compare.</p>;
  const [a,b] = sel.map(i=>careers[i]);
  const rows = [
    {label:'Entry Salary',  va:a.salaryGrowth?.entry?.range,     vb:b.salaryGrowth?.entry?.range},
    {label:'Senior Salary', va:a.salaryGrowth?.senior?.range,    vb:b.salaryGrowth?.senior?.range},
    {label:'Job Growth',    va:a.futureGrowth?.jobGrowthRate,    vb:b.futureGrowth?.jobGrowthRate},
    {label:'Outlook',       va:a.futureGrowth?.outlook,          vb:b.futureGrowth?.outlook},
    {label:'Work Mode',     va:a.futureGrowth?.workMode,         vb:b.futureGrowth?.workMode},
    {label:'Match Score',   va:`${a.matchScore}%`,               vb:`${b.matchScore}%`},
    {label:'Demand Trend',  va:a.futureGrowth?.demandTrend,      vb:b.futureGrowth?.demandTrend},
  ];
  return (
    <div className="comparison">
      <div className="comparison__selectors">
        {[0,1].map(slot=>(
          <div key={slot}>
            <label className="form-label">Career {slot+1}</label>
            <select className="form-input form-select" value={sel[slot]} onChange={e=>setSel(p=>{const n=[...p];n[slot]=parseInt(e.target.value);return n;})}>
              {careers.map((c,i)=><option key={i} value={i}>{MEDAL[i]} {c.title}</option>)}
            </select>
          </div>
        ))}
      </div>
      <div className="comparison__table">
        <div className="comparison__header">
          <div className="comparison__col-head">Metric</div>
          <div className="comparison__col-head">{a.title}</div>
          <div className="comparison__col-head">{b.title}</div>
        </div>
        {rows.map((r,i)=>(
          <div key={i} className="comparison__row">
            <div className="comparison__row-label">{r.label}</div>
            <div className="comparison__row-val">{r.va||'—'}</div>
            <div className="comparison__row-val">{r.vb||'—'}</div>
          </div>
        ))}
      </div>
      <div className="comparison__pros">
        <div className="comparison__pros-col">
          <h5>✅ Pros of {a.title}</h5>
          {a.pros?.map((p,i)=><div key={i} className="pro-item"><span>✅</span>{p}</div>)}
          <h5 style={{marginTop:'1rem'}}>⚠️ Cons</h5>
          {a.cons?.map((c,i)=><div key={i} className="con-item"><span>⚠️</span>{c}</div>)}
        </div>
        <div className="comparison__pros-col">
          <h5>✅ Pros of {b.title}</h5>
          {b.pros?.map((p,i)=><div key={i} className="pro-item"><span>✅</span>{p}</div>)}
          <h5 style={{marginTop:'1rem'}}>⚠️ Cons</h5>
          {b.cons?.map((c,i)=><div key={i} className="con-item"><span>⚠️</span>{c}</div>)}
        </div>
      </div>
    </div>
  );
}

/* ── Live Jobs ────────────────────────────────────────────── */
function LiveJobs({ careerTitle }) {
  const [jobs, setJobs]     = useState([]);
  const [loading,setLoading]= useState(false);
  const [fetched,setFetched]= useState(false);
  const [error,setError]    = useState('');
  const fetch_ = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await api.get(`/career/jobs?title=${encodeURIComponent(careerTitle)}`);
      setJobs(data.jobs||[]); setFetched(true);
    } catch { setError('Could not fetch jobs. Try again later.'); }
    finally { setLoading(false); }
  };
  if (!fetched) return (
    <div className="feature-prompt">
      <div className="feature-prompt__icon">💼</div>
      <div><h4>Live Job Openings</h4><p>Find real open positions for {careerTitle} right now</p></div>
      {error && <p className="feature-error">{error}</p>}
      <button className="btn btn-primary" onClick={fetch_} disabled={loading}>
        {loading?<><span className="btn-spinner"/> Searching...</>:'🔍 Find Live Jobs'}
      </button>
    </div>
  );
  if (!jobs.length) return (
    <div className="feature-prompt">
      <div className="feature-prompt__icon">💼</div>
      <p>No live jobs found for this role right now. Try again later.</p>
      <button className="btn btn-outline btn-sm" onClick={()=>setFetched(false)}>Try Again</button>
    </div>
  );
  return (
    <div className="jobs-list">
      <div className="jobs-list__header">
        <h4>💼 Live Openings — {careerTitle}</h4>
        <span className="badge badge-success">● Updated today</span>
      </div>
      {jobs.map((job,i)=>(
        <div key={i} className="job-card">
          <div className="job-card__left">
            <div className="job-card__icon">🏢</div>
            <div className="job-card__info">
              <div className="job-card__title">{job.title}</div>
              <div className="job-card__meta">
                <span>{job.company}</span>
                <span className="job-card__meta-dot">·</span>
                <span>{job.location}</span>
                <span className="job-card__meta-dot">·</span>
                <span>{job.posted}</span>
                {job.salary && <span className="job-card__salary">{job.salary}</span>}
              </div>
            </div>
          </div>
          <a href={job.url} target="_blank" rel="noreferrer" className="job-card__apply">
            Apply →
          </a>
        </div>
      ))}
      <button className="btn btn-ghost btn-sm" style={{marginTop:'0.75rem'}} onClick={fetch_}>🔄 Refresh Jobs</button>
    </div>
  );
}

/* ── Career Card (original 6 tabs + 5 new GenAI tabs) ────── */
function CareerCard({ career, onSave, assessmentId, isExpanded, onToggle, profile, allCareers }) {
  const [activeTab, setActiveTab] = useState('roadmap');

  const TABS = [
    { id:'roadmap',   label:'🗺️ Roadmap'   },
    { id:'skills',    label:'⚡ Skills'     },
    { id:'analysis',  label:'📊 Skill Gap' },
    { id:'salary',    label:'💰 Salary'    },
    { id:'growth',    label:'📈 Growth'    },
    { id:'courses',   label:'📚 Courses'   },
    { id:'jobs',      label:'💼 Live Jobs' },
    { id:'plan',      label:'📅 Action Plan'},
    { id:'resume',    label:'📄 Resume AI' },
    { id:'interview', label:'🎙️ Interview' },
    { id:'compare',   label:'⚖️ Compare'   },
  ];

  return (
    <div className={`career-card ${isExpanded?'expanded':''}`}>
      <div className="career-card__header" onClick={onToggle}>
        <div className="career-card__rank">{MEDAL[career.rank-1]}</div>
        <div className="career-card__info">
          <div className="career-card__meta">
            <span className="badge badge-accent">{career.field}</span>
            <span className="badge badge-success">{career.futureGrowth?.demandTrend||'High Growth'}</span>
          </div>
          <h3 className="career-card__title">{career.title}</h3>
          <p className="career-card__tagline">{career.tagline}</p>
        </div>
        <div className="career-card__match">
          <div className="match-circle">
            <svg viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="25" fill="none" stroke="rgba(245,158,11,0.15)" strokeWidth="5"/>
              <circle cx="30" cy="30" r="25" fill="none" stroke={RANK_COLORS[career.rank-1]}
                strokeWidth="5" strokeDasharray={`${career.matchScore*1.57} 157`} strokeLinecap="round"
                style={{transform:'rotate(-90deg)',transformOrigin:'center',transition:'stroke-dasharray 0.5s'}}/>
            </svg>
            <span>{career.matchScore}%</span>
          </div>
          <p className="match-label">Match</p>
        </div>
        <div className={`career-card__arrow ${isExpanded?'up':''}`}>▼</div>
      </div>

      {isExpanded && (
        <div className="career-card__body">
          {career.whyItFits && (
            <div className="career-card__why"><span>💡</span><p>{career.whyItFits}</p></div>
          )}

          <div className="tabs">
            {TABS.map(t=>(
              <button key={t.id} className={`tab-btn ${activeTab===t.id?'active':''}`} onClick={()=>setActiveTab(t.id)}>{t.label}</button>
            ))}
          </div>

          {/* ── ORIGINAL 6 TABS ── */}
          {activeTab==='roadmap' && (
            <div className="roadmap">
              {career.roadmap?.map((phase,i)=>(
                <div key={i} className="roadmap-phase">
                  <div className="roadmap-phase__left">
                    <div className="roadmap-phase__dot" style={{background:['#F59E0B','#10B981','#3B82F6','#8B5CF6'][i]}}/>
                    {i<career.roadmap.length-1 && <div className="roadmap-phase__line"/>}
                  </div>
                  <div className="roadmap-phase__content">
                    <div className="roadmap-phase__header">
                      <span className="roadmap-phase__name">{phase.title}</span>
                      <span className="badge badge-primary">{phase.duration}</span>
                    </div>
                    <p className="roadmap-phase__focus">{phase.focus}</p>
                    <ul className="roadmap-phase__milestones">
                      {phase.milestones?.map((m,j)=><li key={j}><span>→</span>{m}</li>)}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab==='skills' && (
            <div className="skills-section">
              <h4 className="skills-section__title">Required Skills</h4>
              <div className="skill-tags">{career.skills?.required?.map((s,i)=><span key={i} className="skill-tag skill-tag--required">{s}</span>)}</div>
              <h4 className="skills-section__title" style={{marginTop:'1.25rem'}}>Nice to Have</h4>
              <div className="skill-tags">{career.skills?.nice_to_have?.map((s,i)=><span key={i} className="skill-tag skill-tag--optional">{s}</span>)}</div>
              <h4 className="skills-section__title" style={{marginTop:'1.25rem'}}>Certifications to Pursue</h4>
              <div className="skill-tags">{career.certifications?.map((c,i)=><span key={i} className="skill-tag skill-tag--cert">{c}</span>)}</div>
            </div>
          )}

          {activeTab==='analysis' && career.skillGapAnalysis && (
            <div className="analysis-section">
              <div className="match-overview">
                <div className="match-bar-container">
                  <div className="match-bar-label"><span>Overall Skill Proficiency Match</span><span>{career.skillGapAnalysis.matchScore}%</span></div>
                  <div className="match-bar-bg"><div className="match-bar-fill" style={{width:`${career.skillGapAnalysis.matchScore}%`}}/></div>
                </div>
                <p className="gap-desc">{career.skillGapAnalysis.gapDescription}</p>
              </div>
              <div className="gap-grid">
                <div className="gap-card gap-card--mastered">
                  <h4 className="gap-card__title">✅ Skills You've Mastered</h4>
                  <div className="skill-tags">{career.skillGapAnalysis.masteredSkills?.map((s,i)=><span key={i} className="skill-tag skill-tag--success">{s}</span>)}</div>
                </div>
                <div className="gap-card gap-card--missing">
                  <h4 className="gap-card__title">🚀 Skills to Learn (The Gap)</h4>
                  <div className="skill-tags">{career.skillGapAnalysis.missingSkills?.map((s,i)=><span key={i} className="skill-tag skill-tag--warning">{s}</span>)}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab==='salary' && career.salaryGrowth && (
            <div>
              <SalaryChart salaryData={career.salaryGrowth}/>
              <div className="salary-cards">
                {Object.entries(career.salaryGrowth).map(([level,d])=>(
                  <div key={level} className="salary-level-card">
                    <div className="salary-level-card__title">{d.title}</div>
                    <div className="salary-level-card__range">{d.range}</div>
                    <div className="salary-level-card__years">{d.years}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab==='growth' && career.futureGrowth && (
            <div className="growth-section">
              <div className="growth-stats">
                <div className="growth-stat"><div className="growth-stat__icon">📊</div><div className="growth-stat__value">{career.futureGrowth.jobGrowthRate}</div><div className="growth-stat__label">Job Growth</div></div>
                <div className="growth-stat"><div className="growth-stat__icon">🎯</div><div className="growth-stat__value">{career.futureGrowth.outlook}</div><div className="growth-stat__label">Outlook</div></div>
                <div className="growth-stat"><div className="growth-stat__icon">🏠</div><div className="growth-stat__value">{career.futureGrowth.workMode}</div><div className="growth-stat__label">Work Mode</div></div>
              </div>
              <h4 className="skills-section__title">Top Companies Hiring</h4>
              <div className="skill-tags">{career.futureGrowth.topCompanies?.map((c,i)=><span key={i} className="skill-tag skill-tag--company">{c}</span>)}</div>
              <h4 className="skills-section__title" style={{marginTop:'1.25rem'}}>Emerging Trends</h4>
              <div className="skill-tags">{career.futureGrowth.emergingTrends?.map((t,i)=><span key={i} className="skill-tag skill-tag--trend">{t}</span>)}</div>
              <h4 className="skills-section__title" style={{marginTop:'1.25rem'}}>Pros & Cons</h4>
              <div className="pros-cons">
                <div className="pros">{career.pros?.map((p,i)=><div key={i} className="pro-item"><span>✅</span>{p}</div>)}</div>
                <div className="cons">{career.cons?.map((c,i)=><div key={i} className="con-item"><span>⚠️</span>{c}</div>)}</div>
              </div>
            </div>
          )}

          {activeTab==='courses' && (
            <div className="courses-grid">
              {career.courses?.map((course,i)=>(
                <div key={i} className="course-card">
                  <div className="course-card__header">
                    <span className={`badge ${course.type==='Free'?'badge-success':'badge-accent'}`}>{course.type}</span>
                    <span className="badge badge-primary">{course.level}</span>
                  </div>
                  <h4 className="course-card__name">{course.name}</h4>
                  <p className="course-card__desc">{course.description}</p>
                  <div className="course-card__meta"><span>📦 {course.platform}</span><span>⏱️ {course.duration}</span></div>
                  {course.url && course.url!=='https://example.com' && (
                    <a href={course.url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm course-card__link">View Course →</a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── NEW GENAI TABS ── */}
          {activeTab==='jobs'      && <LiveJobs careerTitle={career.title}/>}
          {activeTab==='plan'      && <ActionPlan career={career} profile={profile}/>}
          {activeTab==='resume'    && <ResumeAnalyzer career={career}/>}
          {activeTab==='interview' && <MockInterview career={career}/>}
          {activeTab==='compare'   && <CareerComparison careers={allCareers}/>}

          <button className="btn btn-primary career-save-btn" onClick={()=>onSave(assessmentId,career.title)}>
            ⭐ Save This Career
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Results Page ─────────────────────────────────────────── */
export default function ResultsPage() {
  const { assessmentId }  = useParams();
  const { currentAssessment, getAssessment, saveCareer } = useCareer();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [expandedCard, setExpandedCard] = useState(0);
  const navigate = useNavigate();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{
    const load = async () => {
      if (currentAssessment?.assessmentId===assessmentId) {
        setAssessment(currentAssessment); setLoading(false); return;
      }
      try {
        const data = await getAssessment(assessmentId);
        setAssessment({ recommendations: data.recommendations, assessmentId, studentProfile: data.studentProfile });
      } catch { navigate('/dashboard'); }
      finally { setLoading(false); }
    };
    load();
  },[assessmentId]);

  if (loading) return (
    <div className="loading-screen" style={{paddingTop:'64px'}}>
      <div className="loader"/>
      <p style={{color:'var(--text-muted)',marginTop:'1rem',fontSize:'14px'}}>Loading your career results...</p>
    </div>
  );

  const { recommendations, studentProfile } = assessment||{};
  if (!recommendations?.careers?.length) return (
    <div className="results-empty"><p>No results found. <button onClick={()=>navigate('/assessment')} className="btn btn-primary">Try Again</button></p></div>
  );

  return (
    <div className="results-page">
      <div className="results-container">
        <div className="results-header animate-fade-in">
          <span className="section-tag">✨ AI ANALYSIS COMPLETE</span>
          <h1 className="results-title">Your Top 3 <span className="gradient-text">Career Matches</span></h1>
          <p className="results-subtitle">Based on your profile — click any card to expand full details, roadmap, and AI tools</p>
        </div>

        {recommendations.profileSummary && (
          <div className="profile-summary animate-fade-in">
            <div className="profile-summary__icon">🧠</div>
            <div><h3>AI Profile Summary</h3><p>{recommendations.profileSummary}</p></div>
          </div>
        )}

        <div className="career-cards-list">
          {recommendations.careers.map((career,i)=>(
            <CareerCard key={i} career={career} onSave={saveCareer}
              assessmentId={assessmentId}
              isExpanded={expandedCard===i}
              onToggle={()=>setExpandedCard(expandedCard===i?-1:i)}
              profile={studentProfile}
              allCareers={recommendations.careers}
            />
          ))}
        </div>

        {recommendations.generalAdvice && (
          <div className="general-advice animate-fade-in">
            <div className="general-advice__icon">💬</div>
            <div><h3>Personalized Advice From Your AI Counsellor</h3><p>{recommendations.generalAdvice}</p></div>
          </div>
        )}

        <div className="results-actions">
          <button className="btn btn-primary btn-lg" onClick={()=>navigate('/assessment')}>🔄 New Assessment</button>
          <button className="btn btn-outline" onClick={()=>navigate('/dashboard')}>Dashboard</button>
        </div>
      </div>
      <Footer/>
    </div>
  );
}