import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages/LandingPage.css';
import Footer from '../components/Footer';

const FEATURES = [
  { icon: '🧠', title: 'AI-Powered Analysis', desc: 'Gemini AI analyzes your unique profile to find your perfect career matches' },
  { icon: '🗺️', title: 'Detailed Roadmaps', desc: 'Step-by-step career roadmaps with milestones, timelines & action plans' },
  { icon: '💰', title: 'Salary Insights', desc: 'Real salary data from entry level to senior positions across industries' },
  { icon: '📈', title: 'Future Growth', desc: 'Market trends, job growth rates & demand forecasts for each career' },
  { icon: '📚', title: 'Course Recommendations', desc: 'Curated courses from top platforms to build your required skills' },
  { icon: '🤖', title: 'AI Chatbot', desc: '24/7 career counsellor chatbot for instant answers to your questions' },
];

const STATS = [
  { value: '50K+', label: 'Students Helped' },
  { value: '200+', label: 'Career Paths' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '3 sec', label: 'Analysis Time' },
];

const STEPS = [
  { step: '01', title: 'Fill Your Profile', desc: 'Tell us about your education, interests, skills, and goals' },
  { step: '02', title: 'AI Analyzes', desc: 'Our Gemini AI processes your profile against 200+ career parameters' },
  { step: '03', title: 'Get Recommendations', desc: 'Receive top 3 personalized career recommendations with full details' },
  { step: '04', title: 'Start Your Journey', desc: 'Follow your custom roadmap and track your progress' },
];

export default function LandingPage() {
  const heroRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * 20;
      const y = (clientY / innerHeight - 0.5) * 20;
      heroRef.current.style.setProperty('--mouse-x', `${x}px`);
      heroRef.current.style.setProperty('--mouse-y', `${y}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero" ref={heroRef}>
        <div className="hero__bg">
          <div className="hero__orb hero__orb--1"></div>
          <div className="hero__orb hero__orb--2"></div>
          <div className="hero__orb hero__orb--3"></div>
          <div className="hero__grid"></div>
        </div>

        <div className="hero__content">
          <div className="hero__badge animate-fade-in">
            <span className="hero__badge-dot"></span>
            Powered by Google Gemini AI
          </div>

          <h1 className="hero__title animate-fade-in stagger-1">
            Discover Your
            <span className="hero__title-gradient"> Perfect Career</span>
            <br />with AI Precision
          </h1>

          <p className="hero__subtitle animate-fade-in stagger-2">
            Get personalized career recommendations, detailed roadmaps, salary insights,
            and expert guidance — all powered by cutting-edge AI.
          </p>

          <div className="hero__actions animate-fade-in stagger-3">
            <Link to="/register" className="btn btn-primary btn-xl hero__cta">
              <span>🚀</span>
              Start Free Assessment
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg">
              Sign In
            </Link>
          </div>

          <div className="hero__social-proof animate-fade-in stagger-4">
            <div className="hero__avatars">
              {['A','B','C','D'].map((l,i) => (
                <div key={i} className={`hero__avatar hero__avatar--${i+1}`}>{l}</div>
              ))}
            </div>
            <p><strong>50,000+</strong> students found their dream careers</p>
          </div>
        </div>

        {/* Floating cards */}
        <div className="hero__cards">
          <div className="hero__float-card hero__float-card--1 animate-float">
            <div className="hero__float-card-icon">💼</div>
            <div>
              <div className="hero__float-card-title">Software Engineer</div>
              <div className="hero__float-card-score">98% Match ✨</div>
            </div>
          </div>
          <div className="hero__float-card hero__float-card--2 animate-float" style={{ animationDelay: '1s' }}>
            <div className="hero__float-card-icon">📊</div>
            <div>
              <div className="hero__float-card-title">Data Scientist</div>
              <div className="hero__float-card-score">94% Match ⭐</div>
            </div>
          </div>
          <div className="hero__float-card hero__float-card--3 animate-float" style={{ animationDelay: '0.5s' }}>
            <div className="hero__float-card-icon">🤖</div>
            <div>
              <div className="hero__float-card-title">AI Engineer</div>
              <div className="hero__float-card-score">91% Match 🔥</div>
            </div>
          </div>
        </div>

        <div className="hero__scroll-hint">
          <div className="hero__scroll-arrow"></div>
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="stats-grid">
          {STATS.map((stat, i) => (
            <div key={i} className="stat-card">
              <div className="stat-card__value">{stat.value}</div>
              <div className="stat-card__label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">FEATURES</span>
            <h2 className="section-title">Everything You Need to<br /><span className="gradient-text">Launch Your Career</span></h2>
            <p className="section-subtitle">Comprehensive AI-powered tools to guide you from confusion to career clarity</p>
          </div>

          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="feature-card__icon">{f.icon}</div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">HOW IT WORKS</span>
            <h2 className="section-title">Get Your Career Plan in <span className="gradient-text-warm">4 Simple Steps</span></h2>
          </div>

          <div className="steps-grid">
            {STEPS.map((s, i) => (
              <div key={i} className="step-card">
                <div className="step-card__number">{s.step}</div>
                <div className="step-card__connector"></div>
                <h3 className="step-card__title">{s.title}</h3>
                <p className="step-card__desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-section">
        <div className="cta-section__bg">
          <div className="cta-section__orb"></div>
        </div>
        <div className="section-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Discover Your <span className="gradient-text">Dream Career?</span></h2>
            <p className="cta-subtitle">Join thousands of students who found clarity with AspireHub-AI. It's free to start.</p>
            <Link to="/register" className="btn btn-primary btn-xl">
              <span>⚡</span> Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
