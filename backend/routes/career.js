const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { generateCareerRecommendations } = require('../config/gemini');
const CareerAssessment = require('../models/CareerAssessment');
const User = require('../models/User');

const router = express.Router();

// POST /api/career/analyze - Main AI career analysis
router.post('/analyze', authenticate, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('education').notEmpty().withMessage('Education level is required'),
  body('stream').notEmpty().withMessage('Stream/specialization is required'),
  body('interests').isArray({ min: 1 }).withMessage('At least one interest is required'),
  body('skills').isArray({ min: 1 }).withMessage('At least one skill is required'),
  body('strengths').isArray({ min: 1 }).withMessage('At least one strength is required'),
  body('workPreference').notEmpty().withMessage('Work preference is required'),
  body('goal').notEmpty().withMessage('Career goal is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const studentProfile = {
      name: req.body.name,
      age: req.body.age,
      education: req.body.education,
      stream: req.body.stream,
      gpa: req.body.gpa,
      interests: req.body.interests,
      skills: req.body.skills,
      strengths: req.body.strengths,
      workPreference: req.body.workPreference,
      locationPreference: req.body.locationPreference,
      goal: req.body.goal,
      dreamCompanies: req.body.dreamCompanies,
      budget: req.body.budget,
      timeline: req.body.timeline
    };

    // Create assessment record
    const assessment = await CareerAssessment.create({
      userId: req.userId,
      studentProfile,
      status: 'pending'
    });

    // Generate AI recommendations
    const recommendations = await generateCareerRecommendations(studentProfile);

    // Update assessment with results
    assessment.recommendations = recommendations;
    assessment.status = 'completed';
    await assessment.save();

    // Update user stats
    await User.findByIdAndUpdate(req.userId, {
      $inc: { assessmentsTaken: 1 },
      $set: {
        lastAssessment: new Date(),
        profile: studentProfile
      }
    });

    res.json({
      message: 'Career analysis complete',
      assessmentId: assessment._id,
      recommendations
    });

  } catch (error) {
    if (error.message?.includes('JSON')) {
      return res.status(500).json({ error: 'AI response parsing failed. Please try again.' });
    }
    next(error);
  }
});

// GET /api/career/history - Get user's past assessments
router.get('/history', authenticate, async (req, res, next) => {
  try {
    const assessments = await CareerAssessment.find({
      userId: req.userId,
      status: 'completed'
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('studentProfile.name createdAt recommendations.careers savedCareers status');

    res.json({ assessments });
  } catch (error) {
    next(error);
  }
});

// GET /api/career/assessment/:id - Get specific assessment
router.get('/assessment/:id', authenticate, async (req, res, next) => {
  try {
    const assessment = await CareerAssessment.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    res.json({ assessment });
  } catch (error) {
    next(error);
  }
});

// POST /api/career/save - Save a career from assessment
router.post('/save', authenticate, async (req, res, next) => {
  try {
    const { assessmentId, careerTitle } = req.body;

    const assessment = await CareerAssessment.findOne({
      _id: assessmentId,
      userId: req.userId
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    const alreadySaved = assessment.savedCareers.find(c => c.careerTitle === careerTitle);
    if (alreadySaved) {
      return res.status(400).json({ error: 'Career already saved' });
    }

    assessment.savedCareers.push({ careerTitle });
    await assessment.save();

    res.json({ message: 'Career saved successfully', savedCareers: assessment.savedCareers });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

// ── NEW GENAI ROUTES ────────────────────────────────────────────────

const { generateGeminiText } = require('../config/gemini');

// Helper: fallback jobs when no Adzuna key
function getFallbackJobs(title) {
  return [
    { title: `${title}`, company: 'Accenture', location: 'Bangalore', salary: '₹6–14 LPA', posted: 'Today', url: 'https://www.linkedin.com/jobs/' },
    { title: `Junior ${title}`, company: 'Infosys', location: 'Hyderabad', salary: '₹5–10 LPA', posted: '2 days ago', url: 'https://www.naukri.com/' },
    { title: `${title} Trainee`, company: 'Wipro', location: 'Pune / Remote', salary: '₹4–8 LPA', posted: '3 days ago', url: 'https://www.indeed.co.in/' },
  ];
}


// Helper: retry Gemini calls on 429 with exponential backoff
async function retryGemini(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      const is429 = err.status === 429 || err.message?.includes('429') || err.message?.includes('Too Many');
      if (is429 && i < maxRetries - 1) {
        const delay = (i + 1) * 3000; // 3s, 6s, 9s
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
}

// POST /api/career/action-plan
router.post('/action-plan', authenticate, async (req, res, next) => {
  try {
    const { careerTitle, skills = [], missingSkills = [], goal = '' } = req.body;
    if (!careerTitle) return res.status(400).json({ error: 'careerTitle required' });

    const prompt = `You are an expert career coach. Create a realistic 7-day starter action plan for someone targeting: ${careerTitle}.
Their goal: ${goal || 'Enter the field as fast as possible'}
Skills they have: ${skills.join(', ') || 'none listed'}
Skills they need: ${missingSkills.join(', ') || 'none listed'}

Return ONLY a valid JSON array, no markdown, no preamble:
[{"day":1,"focus":"Short day title","tasks":["Task 1","Task 2","Task 3"],"resource":"Specific free resource to use today"}]
Generate exactly 7 days. Be specific and actionable. Return only the JSON array.`;

    const raw = await retryGemini(() => generateGeminiText(prompt));
    const clean = raw.replace(/```json|```/g, '').trim();
    const plan = JSON.parse(clean);
    res.json({ plan });
  } catch (error) { next(error); }
});

// POST /api/career/analyze-resume
router.post('/analyze-resume', authenticate, async (req, res, next) => {
  try {
    const { resumeText, careerTitle, requiredSkills = [] } = req.body;
    if (!resumeText || !careerTitle) return res.status(400).json({ error: 'resumeText and careerTitle required' });

    const prompt = `You are an expert recruiter. Analyze this resume for the role of ${careerTitle}.
Required skills: ${requiredSkills.join(', ') || 'standard industry skills'}

Resume:
${resumeText.substring(0, 3000)}

Return ONLY a valid JSON object, no markdown:
{"score":75,"summary":"One honest sentence assessment","matched":["skill1","skill2"],"missing":["skill3","skill4"],"tips":["Specific actionable tip 1","Tip 2","Tip 3","Tip 4"]}
Score out of 100. Be honest and specific.`;

    const raw = await retryGemini(() => generateGeminiText(prompt));
    const clean = raw.replace(/```json|```/g, '').trim();
    const analysis = JSON.parse(clean);
    res.json({ analysis });
  } catch (error) { next(error); }
});

// POST /api/career/mock-interview
router.post('/mock-interview', authenticate, async (req, res, next) => {
  try {
    const { careerTitle } = req.body;
    if (!careerTitle) return res.status(400).json({ error: 'careerTitle required' });

    const prompt = `Generate 5 realistic interview questions for a fresher ${careerTitle} role.
Mix: 2 technical, 2 behavioural, 1 situational.
Return ONLY a JSON array of 5 question strings, no markdown:
["Question 1","Question 2","Question 3","Question 4","Question 5"]`;

    const raw = await retryGemini(() => generateGeminiText(prompt));
    const clean = raw.replace(/```json|```/g, '').trim();
    const questions = JSON.parse(clean);
    res.json({ questions });
  } catch (error) { next(error); }
});

// POST /api/career/score-interview
router.post('/score-interview', authenticate, async (req, res, next) => {
  try {
    const { careerTitle, qa } = req.body;
    if (!careerTitle || !qa) return res.status(400).json({ error: 'careerTitle and qa required' });

    const prompt = `You are a strict expert interviewer for ${careerTitle}. Score each answer honestly and critically.

STRICT SCORING RULES:
- Empty answer, "...", "n/a", gibberish, or less than 10 meaningful characters = score 0. No exceptions.
- One word or one sentence with no substance = score 5-15 maximum
- Vague answer with no specific knowledge = score 20-35 maximum
- Decent answer with some relevant points = score 40-65
- Good answer with specific knowledge and structure = score 66-80
- Excellent, detailed, well-structured answer = score 81-100
- NEVER give a high score to an empty or meaningless answer. That is dishonest.

${qa.map((item, i) => `Q${i+1}: ${item.question}\nA${i+1}: ${item.answer && item.answer.trim().length > 5 ? item.answer : '(no meaningful answer provided)'}`).join('\n\n')}

Return ONLY a JSON array, no markdown:
[{"score":0,"feedback":"Specific honest 2-sentence feedback. If empty/gibberish, say so directly."}]
Be strict, honest, and constructive. Return only the JSON array.`;

    const raw = await retryGemini(() => generateGeminiText(prompt));
    const clean = raw.replace(/```json|```/g, '').trim();
    const results = JSON.parse(clean);
    res.json({ results });
  } catch (error) { next(error); }
});

// GET /api/career/jobs
router.get('/jobs', authenticate, async (req, res, next) => {
  try {
    const title = req.query.title || 'Software Engineer';
    const appId  = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    if (!appId || !appKey) {
      return res.json({ jobs: getFallbackJobs(title) });
    }

    const query = encodeURIComponent(title);
    const url   = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=6&what=${query}&content-type=application/json`;
    const resp  = await fetch(url);
    const data  = await resp.json();

    const jobs = (data.results || []).map(j => ({
      title:   j.title,
      company: j.company?.display_name || 'Company',
      location:j.location?.display_name || 'India',
      salary:  j.salary_min ? `₹${Math.round(j.salary_min/100000)}–${Math.round((j.salary_max||j.salary_min*1.5)/100000)} LPA` : null,
      posted:  j.created ? new Date(j.created).toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : 'Recently',
      url:     j.redirect_url,
    }));

    res.json({ jobs: jobs.length ? jobs : getFallbackJobs(title) });
  } catch (error) {
    res.json({ jobs: getFallbackJobs(req.query.title || '') });
  }
});
