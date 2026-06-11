import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCareer } from '../context/CareerContext';
import toast from 'react-hot-toast';
import '../styles/pages/AssessmentPage.css';

const STEPS = [
  { id: 1, title: 'Basic Info', icon: '👤' },
  { id: 2, title: 'Education', icon: '🎓' },
  { id: 3, title: 'Interests', icon: '💡' },
  { id: 4, title: 'Skills', icon: '⚡' },
  { id: 5, title: 'Goals', icon: '🎯' },
];

const EDUCATION_OPTIONS = ['10th Grade', '12th Grade', 'Diploma', 'BCA', 'BTech/BE', 'BSc', 'BA', 'BBA', 'BCom', 'MTech/ME', 'MCA', 'MBA', 'MSc', 'PhD', 'Other'];
const WORK_PREF = ['Remote', 'On-site', 'Hybrid', 'Flexible'];
const COMMON_INTERESTS = [
  'Programming', 'Data Analysis', 'Design', 'Writing', 'Research', 'Teaching', 'Finance', 'Healthcare',
  'Marketing', 'Entrepreneurship', 'Gaming', 'Art & Painting', 'Music', 'Law', 'Management',
  'Cooking & Culinary Arts', 'Photography', 'Film & Cinematography', 'Fashion & Styling', 'Dance',
  'Theatre & Acting', 'Sports & Fitness', 'Architecture', 'Interior Design', 'Journalism',
  'Psychology', 'Social Work', 'Environment & Sustainability', 'Animation & VFX',
  'Content Creation', 'Travel & Tourism', 'Hospitality', 'Agriculture', 'Aviation',
  'Event Management', 'Wildlife & Nature', 'Music Production', 'Graphic Design'
];
const COMMON_SKILLS = [
  'Python', 'JavaScript', 'Java', 'C++', 'SQL', 'Excel', 'Communication', 'Leadership',
  'Problem Solving', 'Critical Thinking', 'Machine Learning', 'Web Development', 'Data Analysis',
  'Project Management', 'Public Speaking', 'Drawing & Illustration', 'Music Composition',
  'Singing', 'Instrument Playing', 'Cooking Techniques', 'Food Plating', 'Photography',
  'Video Editing', 'Graphic Design', 'Content Writing', 'Social Media', 'Storytelling',
  'Dancing', 'Acting', 'Sewing & Tailoring', 'Fashion Styling', 'Event Planning',
  'Customer Service', 'Negotiation', 'Research & Analysis', 'Teaching', 'Mentoring'
];
const COMMON_STRENGTHS = [
  'Analytical thinking', 'Creativity', 'Attention to detail', 'Team collaboration',
  'Fast learner', 'Self-motivated', 'Communication', 'Technical aptitude', 'Leadership', 'Empathy',
  'Artistic expression', 'Performance & stage presence', 'Patience & persistence',
  'Physical stamina & fitness', 'Business acumen', 'Emotional intelligence',
  'Adaptability', 'Storytelling', 'Visual thinking', 'Hands-on / practical skills'
];

function TagInput({ value, onChange, suggestions, placeholder }) {
  const [input, setInput] = useState('');

  const addTag = (tag) => {
    const clean = tag.trim();
    if (clean && !value.includes(clean) && value.length < 10) {
      onChange([...value, clean]);
    }
    setInput('');
  };

  const removeTag = (tag) => onChange(value.filter(t => t !== tag));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (input) addTag(input);
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div>
      <div className="tag-input">
        {value.map(tag => (
          <span key={tag} className="tag">
            {tag}
            <span className="tag-remove" onClick={() => removeTag(tag)}>×</span>
          </span>
        ))}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (input) addTag(input); }}
          placeholder={value.length === 0 ? placeholder : 'Add more...'}
        />
      </div>
      <div className="tag-suggestions">
        {suggestions.filter(s => !value.includes(s)).slice(0, 8).map(s => (
          <button key={s} type="button" className="tag-suggestion" onClick={() => addTag(s)}>
            + {s}
          </button>
        ))}
      </div>
    </div>
  );
}

const INITIAL = {
  name: '', age: '', education: '', stream: '', gpa: '',
  interests: [], skills: [], strengths: [],
  workPreference: 'Hybrid', locationPreference: '',
  goal: '', dreamCompanies: '', budget: '', timeline: ''
};

export default function AssessmentPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL);
  const { user } = useAuth();
  const { analyzeCareer, isAnalyzing } = useCareer();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user?.name) setForm(f => ({ ...f, name: user.name }));
  }, [user]);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const validateStep = () => {
    if (step === 1 && (!form.name || !form.age)) { toast.error('Please fill name and age'); return false; }
    if (step === 2 && (!form.education || !form.stream)) { toast.error('Please fill education details'); return false; }
    if (step === 3 && form.interests.length === 0) { toast.error('Add at least one interest'); return false; }
    if (step === 4 && form.skills.length === 0) { toast.error('Add at least one skill'); return false; }
    if (step === 5 && !form.goal) { toast.error('Please describe your goal'); return false; }
    return true;
  };

  const next = () => { if (validateStep()) setStep(s => Math.min(s + 1, 5)); };
  const prev = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!validateStep()) return;
    // Validate all required fields before sending
    if (form.strengths.length === 0) {
      toast.error('Please add at least one strength in Step 3');
      setStep(3);
      return;
    }
    try {
      const payload = {
        name:               form.name.trim(),
        age:                form.age,
        education:          form.education,
        stream:             form.stream.trim(),
        gpa:                form.gpa,
        interests:          form.interests,
        skills:             form.skills,
        strengths:          form.strengths,
        workPreference:     form.workPreference || 'Hybrid',
        locationPreference: form.locationPreference,
        goal:               form.goal.trim(),
        dreamCompanies:     form.dreamCompanies,
        budget:             form.budget,
        timeline:           form.timeline,
      };
      const result = await analyzeCareer(payload);
      navigate(`/results/${result.assessmentId}`);
    } catch (e) {
      // error handled in context
    }
  };

  return (
    <div className="assessment-page">
      <div className="assessment-bg">
        <div className="assessment-bg__orb"></div>
      </div>

      <div className="assessment-container">
        {/* Header */}
        <div className="assessment-header animate-fade-in">
          <span className="section-tag">AI CAREER ASSESSMENT</span>
          <h1 className="assessment-title">Tell Us About <span className="gradient-text">Yourself</span></h1>
          <p className="assessment-subtitle">Answer {STEPS.length} quick steps and our AI will recommend your perfect careers</p>
        </div>

        {/* Step Indicator */}
        <div className="step-indicator">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className={`step ${step === s.id ? 'active' : step > s.id ? 'completed' : ''}`}
                onClick={() => step > s.id && setStep(s.id)} style={{ cursor: step > s.id ? 'pointer' : 'default' }}>
                <div className="step-circle">
                  {step > s.id ? '✓' : s.icon}
                </div>
                <span className="step-label hide-mobile">{s.title}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`step-line ${step > s.id ? 'completed' : ''}`}></div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form Card */}
        <div className="assessment-card animate-fade-in">
          <div className="assessment-card__header">
            <span className="assessment-card__step-icon">{STEPS[step - 1].icon}</span>
            <div>
              <h2 className="assessment-card__title">Step {step}: {STEPS[step - 1].title}</h2>
              <p className="assessment-card__subtitle">{step}/{STEPS.length} steps completed</p>
            </div>
            <div className="assessment-card__progress">
              <svg viewBox="0 0 40 40" className="progress-ring">
                <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(99,102,241,0.2)" strokeWidth="3"/>
                <circle cx="20" cy="20" r="16" fill="none" stroke="#6366f1" strokeWidth="3"
                  strokeDasharray={`${(step/5)*100.5} 100.5`} strokeLinecap="round"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dasharray 0.3s' }}/>
              </svg>
            </div>
          </div>

          <div className="assessment-form">
            {/* STEP 1: Basic Info */}
            {step === 1 && (
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input type="text" className="form-input" placeholder="Your name"
                    value={form.name} onChange={e => update('name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Age *</label>
                  <input type="number" className="form-input" placeholder="e.g. 20"
                    value={form.age} onChange={e => update('age', e.target.value)} min="15" max="40" />
                </div>
                <div className="form-group form-group--full">
                  <label className="form-label">Location Preference</label>
                  <input type="text" className="form-input" placeholder="e.g. Bangalore, Mumbai, Remote..."
                    value={form.locationPreference} onChange={e => update('locationPreference', e.target.value)} />
                </div>
                <div className="form-group form-group--full">
                  <label className="form-label">Work Style Preference</label>
                  <div className="option-chips">
                    {WORK_PREF.map(w => (
                      <button key={w} type="button"
                        className={`option-chip ${form.workPreference === w ? 'active' : ''}`}
                        onClick={() => update('workPreference', w)}>{w}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Education */}
            {step === 2 && (
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Education Level *</label>
                  <select className="form-input form-select" value={form.education}
                    onChange={e => update('education', e.target.value)}>
                    <option value="">Select your education</option>
                    {EDUCATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">GPA / Percentage</label>
                  <input type="text" className="form-input" placeholder="e.g. 8.5 CGPA / 85%"
                    value={form.gpa} onChange={e => update('gpa', e.target.value)} />
                </div>
                <div className="form-group form-group--full">
                  <label className="form-label">Stream / Specialization *</label>
                  <input type="text" className="form-input" placeholder="e.g. Computer Science, Electronics, Commerce, Arts..."
                    value={form.stream} onChange={e => update('stream', e.target.value)} />
                </div>
                <div className="form-group form-group--full">
                  <label className="form-label">Dream Companies (optional)</label>
                  <input type="text" className="form-input" placeholder="e.g. Google, Microsoft, Flipkart, Startup..."
                    value={form.dreamCompanies} onChange={e => update('dreamCompanies', e.target.value)} />
                </div>
              </div>
            )}

            {/* STEP 3: Interests */}
            {step === 3 && (
              <div>
                <div className="form-group">
                  <label className="form-label">Your Interests & Passions * <span className="form-hint">(type + Enter, or click suggestions)</span></label>
                  <TagInput value={form.interests} onChange={v => update('interests', v)} suggestions={COMMON_INTERESTS} placeholder="e.g. Machine Learning, Design..." />
                </div>
                <div className="form-group" style={{ marginTop: '1.5rem' }}>
                  <label className="form-label">Your Key Strengths * <span className="form-hint">(what you're naturally good at)</span></label>
                  <TagInput value={form.strengths} onChange={v => update('strengths', v)} suggestions={COMMON_STRENGTHS} placeholder="e.g. Problem Solving, Creativity..." />
                </div>
              </div>
            )}

            {/* STEP 4: Skills */}
            {step === 4 && (
              <div>
                <div className="form-group">
                  <label className="form-label">Technical & Soft Skills * <span className="form-hint">(current skills you have)</span></label>
                  <TagInput value={form.skills} onChange={v => update('skills', v)} suggestions={COMMON_SKILLS} placeholder="e.g. Python, Excel, Communication..." />
                </div>
                <div className="assessment-tip">
                  <span>💡</span>
                  <p>Be honest about your current skill level. Our AI uses this to suggest the most achievable career paths and required learning gaps.</p>
                </div>
              </div>
            )}

            {/* STEP 5: Goals */}
            {step === 5 && (
              <div className="form-grid">
                <div className="form-group form-group--full">
                  <label className="form-label">Career Goal / Aspiration * <span className="form-hint">(be specific and honest)</span></label>
                  <textarea className="form-input" rows={4}
                    placeholder="e.g. I want to become a professional chef and open my own restaurant, or I want to be a musician/singer, or I want to work in film direction, or become a fashion designer, or work in AI/ML... Be specific about YOUR dream!"
                    value={form.goal} onChange={e => update('goal', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Budget for Learning</label>
                  <select className="form-input form-select" value={form.budget} onChange={e => update('budget', e.target.value)}>
                    <option value="">Select budget range</option>
                    <option value="Free only">Free only</option>
                    <option value="Under ₹5,000">Under ₹5,000</option>
                    <option value="₹5,000 - ₹20,000">₹5,000 - ₹20,000</option>
                    <option value="₹20,000 - ₹50,000">₹20,000 - ₹50,000</option>
                    <option value="Above ₹50,000">Above ₹50,000</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Timeline to Get a Job</label>
                  <select className="form-input form-select" value={form.timeline} onChange={e => update('timeline', e.target.value)}>
                    <option value="">Select timeline</option>
                    <option value="ASAP (0-3 months)">ASAP (0-3 months)</option>
                    <option value="6 months">6 months</option>
                    <option value="1 year">1 year</option>
                    <option value="2+ years">2+ years</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="assessment-nav">
            <button type="button" className="btn btn-ghost" onClick={prev} disabled={step === 1}>
              ← Back
            </button>

            <div className="assessment-nav__dots">
              {STEPS.map(s => (
                <div key={s.id} className={`assessment-nav__dot ${step === s.id ? 'active' : step > s.id ? 'done' : ''}`}></div>
              ))}
            </div>

            {step < 5 ? (
              <button type="button" className="btn btn-primary" onClick={next}>
                Continue →
              </button>
            ) : (
              <button type="button" className="btn btn-accent btn-lg" onClick={handleSubmit} disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <><span className="btn-spinner"></span> Analyzing with AI...</>
                ) : (
                  <><span>🧠</span> Analyze My Career</>
                )}
              </button>
            )}
          </div>
        </div>

        {/* AI Analysis Overlay */}
        {isAnalyzing && (
          <div className="analyzing-overlay">
            <div className="analyzing-card">
              <div className="analyzing-spinner"></div>
              <h3 className="analyzing-title">AI is Analyzing Your Profile</h3>
              <p className="analyzing-sub">Gemini AI is matching your profile across every career field in the world...</p>
              <div className="analyzing-steps">
                {['Analyzing your interests & passions', 'Matching across 500+ global careers', 'Building personalized roadmaps', 'Compiling courses & resources'].map((t, i) => (
                  <div key={i} className="analyzing-step" style={{ animationDelay: `${i * 0.8}s` }}>
                    <span className="analyzing-step__dot"></span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
