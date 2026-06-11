# AspireHub-AI 2.0 🧭 - GenAI Career Counselling System

> AI-powered career counselling covering 500+ career paths across every field — from tech to culinary arts, music to medicine, fashion to finance. Not just another tech career tool.

---

## 🔗 Links

📌 GitHub v1: [AspireHub-AI](https://github.com/MahekKhan14/AspireHub-AI) — See v2 for the full GenAI upgrade.

---

## What is AspireHub-AI 2.0?

AspireHub-AI 2.0 is a full-stack GenAI career counselling platform that uses Google Gemini API to analyse a student’s unique profile — including interests, skills, strengths, education, and goals — and recommends the top 3 most suitable career paths from any field.

Unlike generic career tools that mostly default to tech roles, AspireHub-AI covers multiple domains such as AI Engineering, Culinary Arts, Fashion Design, Wildlife Photography, Music, Law, Healthcare, Finance, Sports, Film, Design, and more. The platform provides detailed, personalised, and domain-specific guidance for each career path.

Built as a production-level full-stack application with authentication, admin panel, AI chatbot, real-time job listings, and multiple GenAI-powered career tools added in v2.

---

## ✨ Features

### 🧠 AI Career Analysis

* 5-step smart assessment covering education, interests, skills, strengths, and goals
* Gemini AI analyses the user profile across 500+ career paths
* Returns top 3 career matches with match score, tagline, and personalised explanation
* Covers tech, arts, music, culinary, sports, fashion, film, law, medicine, finance, and more
* Realistic salary calibration based on each career domain

### 🗺️ Personalised Career Roadmaps

* Phase-wise roadmap from foundation to mastery
* Career-specific milestones, focus areas, and timelines
* Roadmap adapts based on the user’s target timeline

### 💰 Salary Growth Data

* Entry to expert-level salary ranges
* Visual salary progression chart
* Experience-level context for every career stage

### 📈 Future Growth & Market Insights

* Job growth rate, market outlook, and demand trend
* Relevant companies and organisations for each career
* Emerging trends and work mode insights

### 📚 Course Recommendations

* Career-specific course suggestions
* Free and paid options based on user budget
* Includes platforms such as Coursera, YouTube, MasterClass, NIFT, NID, culinary schools, and music academies

### ⚡ Skill Gap Analysis

* Compares user’s current skills with required career skills
* Shows mastered skills and skills to learn
* AI-generated personalised gap explanation

### 💼 Live Job Board

* Real job listings using Adzuna API
* Filtered by recommended career title
* Shows company, location, salary, posted date, and apply link
* Includes fallback listings when API keys are unavailable

### 📅 AI 7-Day Action Plan

* One-click personalised 7-day starter plan for the top recommended career
* Daily tasks based on user skills, gaps, and goals
* Includes free learning resources
* Powered by Gemini with retry handling for rate limits

### 📄 AI Resume Analyzer

* Analyses pasted resume text against the target career
* Scores resume out of 100
* Shows matched skills, missing skills, and improvement tips
* Gives an honest summary of resume readiness

### 🎙️ AI Mock Interview

* Generates role-specific interview questions
* Includes technical, behavioural, and situational questions
* Scores user answers with constructive AI feedback
* Provides final performance summary

### ⚖️ Career Comparison Tool

* Compares any 2 recommended careers side by side
* Shows salary, growth rate, outlook, work mode, demand trend, and match score
* Helps users make a confident career decision

### 🤖 AspireBot — AI Career Chatbot

* Persistent AI chatbot available across the platform
* Helps with career doubts, salary questions, course advice, portfolio tips, and career switching
* Supports multi-turn career guidance using Gemini API

### 👤 Admin Panel

* Admin-only protected route
* User and assessment overview
* Domain coverage analytics
* Skill gap trends and saved career data

### 🔐 Authentication

* JWT-based authentication
* bcrypt password hashing
* Protected frontend and backend routes
* User profile with assessment history and saved careers

---

## 🛠️ Tech Stack

| Layer      | Technology                                            |
| ---------- | ----------------------------------------------------- |
| Frontend   | React.js, CSS3 custom design system, Recharts         |
| Backend    | Node.js, Express.js, REST APIs, JWT                   |
| Database   | MongoDB, Mongoose                                     |
| AI / LLM   | Gemini API, gemini-2.5-flash-lite, Prompt Engineering |
| Job Data   | Adzuna API                                            |
| Auth       | JWT, bcryptjs                                         |
| Deployment | Render-ready                                          |

---

## 🧬 AI Architecture

```text
User Assessment
        ↓
Node.js / Express Backend
        ↓
Gemini API with career counselling system prompt
        ↓
Structured JSON Output
        ↓
Career Recommendations, Roadmaps, Salary Insights, Skill Gap, Courses
        ↓
Results Page with GenAI Career Tools
```

### GenAI Feature Flow

```text
Action Plan / Resume Analyzer / Mock Interview
        ↓
Shared Gemini helper
        ↓
Retry logic with exponential backoff
        ↓
Structured JSON response
        ↓
Rendered in interactive tab UI
```

---

## 📁 Project Structure

```text
final_aspirehub/
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── Navbar.js
│       │   ├── Footer.js
│       │   └── ChatbotWidget.js
│       ├── pages/
│       │   ├── LandingPage.js
│       │   ├── LoginPage.js
│       │   ├── RegisterPage.js
│       │   ├── AssessmentPage.js
│       │   ├── ResultsPage.js
│       │   ├── DashboardPage.js
│       │   ├── HistoryPage.js
│       │   └── AdminPage.js
│       ├── context/
│       │   ├── AuthContext.js
│       │   └── CareerContext.js
│       └── styles/
│           ├── global.css
│           ├── pages/
│           └── components/
│
└── backend/
    ├── config/
    │   ├── gemini.js
    │   └── database.js
    ├── routes/
    │   ├── career.js
    │   ├── auth.js
    │   ├── chatbot.js
    │   ├── admin.js
    │   └── user.js
    ├── models/
    │   ├── User.js
    │   └── CareerAssessment.js
    ├── middleware/
    │   └── auth.js
    └── resetAdmin.js
```

---

## 🆚 v1 vs v2 — What Changed

| Feature                 | v1              | v2                                 |
| ----------------------- | --------------- | ---------------------------------- |
| Career Analysis         | Basic           | Improved GenAI prompts             |
| Roadmap, Salary, Growth | Available       | Better UI and richer output        |
| Courses                 | Available       | Fixed and improved recommendations |
| Skill Gap Analysis      | Available       | Visual upgrade                     |
| Live Job Board          | Not available   | Added with Adzuna API              |
| AI Action Plan          | Not available   | Added                              |
| AI Resume Analyzer      | Not available   | Added                              |
| AI Mock Interview       | Not available   | Added                              |
| Career Comparison       | Not available   | Added                              |
| Visual Design           | Purple / Indigo | Navy + Amber brand                 |
| Font System             | Poppins         | Plus Jakarta Sans + Inter          |
| Chatbot UI              | Basic           | Redesigned AspireBot widget        |
| Admin Panel             | Available       | Improved branded dashboard         |
| Assessment UX           | Available       | Smoother flow and validation fixes |

---

## 💡 What This Demonstrates

* GenAI Engineering with multi-task LLM pipelines
* Prompt Engineering for structured JSON output
* Full-stack MERN development
* REST API development with modular backend architecture
* Gemini API integration with retry and fallback handling
* Third-party API integration using Adzuna Jobs API
* MongoDB schema design for users, assessments, and saved careers
* JWT authentication and protected routes
* Admin dashboard and analytics
* Responsive UI/UX with a custom design system

---

## 🎯 Purpose

AspireHub-AI was built to solve a real problem: career confusion among students. Most career tools give generic recommendations or mostly suggest tech roles. AspireHub-AI 2.0 provides personalised, realistic, and domain-aware guidance across multiple career fields.

Version 2 upgrades the platform from a career recommendation system into a complete AI-powered career coaching system — from career discovery to roadmap planning, resume improvement, job exploration, and interview preparation.

---

## 👩‍💻 Author

**Mahek Khan**

---

*Crafted with ♥ by Mahek*
