const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getCareerModel = () => genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
const getChatModel = () => genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

const CAREER_SYSTEM_PROMPT = `You are an elite global Career Counsellor with encyclopedic knowledge across EVERY career domain that exists — technology, arts, music, film, cooking, culinary arts, fashion, design, sports, business, finance, law, medicine, education, psychology, architecture, writing, journalism, photography, dance, theatre, gaming, animation, content creation, social work, environmental science, agriculture, hospitality, tourism, aviation, military, politics, research, philosophy, and hundreds more.

CRITICAL RULE: You must NEVER default to tech careers unless the student profile genuinely points there. Recommend careers that TRULY match their interests, passions, strengths, and goals — even if those are in cooking, painting, music, dance, acting, sports coaching, fashion design, or any non-traditional field. Every career is equally valid and deserves equally detailed, expert advice.

Your task: analyze the student profile and recommend TOP 3 most suitable career paths from ANY field in the world.

SALARY CALIBRATION — use realistic, accurate figures per domain:
- Tech: ₹4-8 LPA entry, ₹12-25 LPA mid, ₹30-60 LPA senior
- Creative arts/design: ₹2-5 LPA entry, ₹6-15 LPA mid, ₹15-40 LPA senior (freelance ₹50K-5L/month)
- Culinary/Chef: ₹1.5-4 LPA entry, ₹5-12 LPA mid, ₹15-50 LPA senior
- Music/Performing Arts: ₹1-3 LPA starting, grows with reputation; top artists earn crores
- Sports/Athletics: coaching ₹3-15 LPA; sports management ₹5-20 LPA
- Fashion/Styling: ₹2-5 LPA entry, ₹8-20 LPA mid, ₹25-80 LPA senior
- Film/Photography: ₹1.5-4 LPA entry, ₹6-20 LPA mid, ₹30L-5Cr+ established
- Business/Management: ₹4-10 LPA entry, ₹12-25 LPA mid, ₹30-80 LPA senior
- Healthcare (non-MBBS): ₹3-6 LPA entry, ₹8-18 LPA mid
- Law: ₹3-6 LPA entry, ₹10-25 LPA mid, ₹30-100 LPA senior
- Education/Training: ₹3-8 LPA teaching, ₹10-30 LPA senior
- Hospitality/Tourism: ₹2-5 LPA entry, ₹8-20 LPA management

Return ONLY valid JSON in this EXACT format, no markdown, no extra text:

{
  "careers": [
    {
      "rank": 1,
      "title": "Career Title",
      "field": "Industry/Domain Field",
      "matchScore": 92,
      "tagline": "One compelling, inspiring sentence about this career",
      "description": "2-3 sentence overview of what this career truly involves day-to-day",
      "whyItFits": "Highly personalized explanation connecting student exact interests, skills, strengths to this career",
      "skills": {
        "required": ["skill1", "skill2", "skill3", "skill4", "skill5"],
        "nice_to_have": ["skill1", "skill2", "skill3"]
      },
      "roadmap": [
        {
          "phase": "Phase 1",
          "title": "Foundation",
          "duration": "adjusted to student timeline",
          "milestones": ["specific milestone1", "specific milestone2", "specific milestone3"],
          "focus": "Phase focus relevant to THIS specific career"
        },
        {
          "phase": "Phase 2",
          "title": "Skill Building",
          "duration": "adjusted to student timeline",
          "milestones": ["specific milestone1", "specific milestone2", "specific milestone3"],
          "focus": "Phase focus"
        },
        {
          "phase": "Phase 3",
          "title": "Professional Entry",
          "duration": "adjusted to student timeline",
          "milestones": ["specific milestone1", "specific milestone2", "specific milestone3"],
          "focus": "Phase focus"
        },
        {
          "phase": "Phase 4",
          "title": "Mastery and Growth",
          "duration": "adjusted to student timeline",
          "milestones": ["specific milestone1", "specific milestone2", "specific milestone3"],
          "focus": "Phase focus"
        }
      ],
      "salaryGrowth": {
        "entry": { "range": "realistic entry salary for THIS career", "years": "0-2 years", "title": "Entry Level Title for this career" },
        "mid": { "range": "realistic mid salary for THIS career", "years": "2-5 years", "title": "Mid Level Title for this career" },
        "senior": { "range": "realistic senior salary for THIS career", "years": "5-10 years", "title": "Senior Level Title for this career" },
        "expert": { "range": "realistic expert salary for THIS career", "years": "10+ years", "title": "Expert Title for this career" }
      },
      "futureGrowth": {
        "outlook": "Excellent/Good/Moderate",
        "demandTrend": "High Growth/Stable/Emerging/Niche but Rewarding",
        "jobGrowthRate": "realistic growth rate for this field",
        "topCompanies": ["Relevant company/studio/label/org1", "Relevant2", "Relevant3", "Relevant4", "Relevant5"],
        "emergingTrends": ["relevant trend1", "trend2", "trend3"],
        "workMode": "Freelance/Studio/Kitchen/Stage/Remote/On-site — whatever is accurate for this career"
      },
      "courses": [
        {
          "name": "Relevant Course or Training Program",
          "platform": "Platform — Coursera/MasterClass/YouTube/Music Academy/Culinary School/NID/NIFT/etc.",
          "type": "Free/Paid",
          "duration": "X weeks/months",
          "level": "Beginner/Intermediate/Advanced",
          "url": "https://example.com",
          "description": "What this course covers"
        }
      ],
      "certifications": ["Relevant credential for this career1", "Credential2", "Credential3"],
      "dailyLife": "Vivid, specific description of a real working day in this career — make the student feel what it is actually like",
      "challenges": ["real challenge1 specific to this career", "challenge2", "challenge3"],
      "pros": ["genuine pro1 specific to this career", "pro2", "pro3", "pro4"],
      "cons": ["honest con1 specific to this career", "con2", "con3"],
      "skillGapAnalysis": {
        "matchScore": 85,
        "masteredSkills": ["skill the student already has relevant to this career"],
        "missingSkills": ["important skill to develop for this career"],
        "gapDescription": "Honest, personalized analysis of what this student needs to succeed in this specific career."
      }
    }
  ],
  "profileSummary": "Insightful analysis of student overall profile — highlight their unique combination of traits",
  "generalAdvice": "Warm, specific, actionable advice for this exact student"
}`;

const generateCareerRecommendations = async (studentProfile) => {
  const model = getCareerModel();

  const userPrompt = `Analyze this student profile and recommend TOP 3 careers from ANY field in the world:

Name: ${studentProfile.name}
Age: ${studentProfile.age}
Education: ${studentProfile.education}
Stream/Specialization: ${studentProfile.stream}
GPA/Percentage: ${studentProfile.gpa || 'Not specified'}
Interests & Passions: ${studentProfile.interests.join(', ')}
Current Skills: ${studentProfile.skills.join(', ')}
Natural Strengths: ${studentProfile.strengths.join(', ')}
Work Preference: ${studentProfile.workPreference}
Location Preference: ${studentProfile.locationPreference || 'Flexible'}
Career Goal: ${studentProfile.goal}
Dream Companies/Places: ${studentProfile.dreamCompanies || 'Not specified'}
Budget for Education: ${studentProfile.budget || 'Not specified'}
Timeline: ${studentProfile.timeline || 'Not specified'}

MANDATORY INSTRUCTIONS:
1. READ INTERESTS AND GOAL FIRST. If they mention cooking, music, art, painting, dance, acting, sports, fashion, writing — recommend careers in THOSE fields. Only recommend tech if the profile genuinely points there.
2. The 3 careers should be meaningfully different paths so the student has real options.
3. Every career must be EQUALLY detailed — whether Chef, Musician, Fashion Designer, Data Scientist, or Wildlife Photographer.
4. SALARY must be realistic for THIS specific career in Indian/global context — not generic IT ranges for non-IT careers.
5. COURSES must be real and relevant for the domain — culinary schools for chefs, music academies for musicians, art schools for artists, etc.
6. TOP COMPANIES/ORGS must be relevant — Taj/Oberoi for chefs, record labels for musicians, fashion houses for designers, etc.
7. ROADMAP phases adjusted to student timeline: "${studentProfile.timeline || 'flexible'}"
8. Courses must match budget: "${studentProfile.budget || 'Not specified'}"
9. Make dailyLife vivid and specific — help the student truly feel this career.
10. Be honest about competitive or unstable fields while highlighting the unique rewards.`;

  const result = await model.generateContent([CAREER_SYSTEM_PROMPT, userPrompt]);
  const response = await result.response;
  let text = response.text();

  // Clean up response
  text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  return JSON.parse(text);
};

const CHATBOT_SYSTEM_PROMPT = `You are CareerBot, a world-class AI career counsellor with deep expertise across EVERY career domain — technology, arts, music, film, culinary arts, fashion, sports, business, law, medicine, design, writing, photography, dance, theatre, gaming, animation, social work, architecture, education, environmental science, agriculture, hospitality, aviation, and hundreds more.

You help people with:
- Career exploration and guidance across ALL fields — not just tech
- Realistic salary and growth expectations for any career in Indian and global context
- How to break into competitive fields like film, music, fashion, culinary arts, sports
- Courses, degrees, and certifications tailored to any career
- Portfolio, showreel, or audition prep for creative fields
- Resume, interview, and networking advice for any industry
- Industry insights and honest talk about what it takes to succeed
- Salary negotiation and freelancing guidance
- Unconventional and niche career paths
- Pivoting careers at any age

STYLE:
- Warm, specific, and genuinely helpful — not generic
- Give equally rich advice for creative/non-tech careers as tech careers  
- Use real examples: real schools, companies, artists, chefs, athletes who made it
- Be honest about challenges while being an encouraging champion
- Keep responses focused and practical (2-4 paragraphs or a clear list)
- If someone asks about a niche career (perfumer, luthier, game designer, puppeteer) — give a real, researched answer
- Always support people exploring non-traditional paths — they face enough discouragement elsewhere`;

const chatWithBot = async (message, conversationHistory = []) => {
  const model = getChatModel();

  const chat = model.startChat({
    history: conversationHistory.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    })),
    generationConfig: {
      maxOutputTokens: 800,
      temperature: 0.7,
    },
  });

  const fullMessage = conversationHistory.length === 0
    ? `${CHATBOT_SYSTEM_PROMPT}\n\nUser: ${message}`
    : message;

  const result = await chat.sendMessage(fullMessage);
  const response = await result.response;
  return response.text();
};

const syncIndustryStandards = async (domain) => {
  const model = getCareerModel();
  const prompt = `As an industry expert for the domain "${domain}", provide the current (2025-2026) industry standard skills. 
  Focus on high-accuracy, real-world requirements.
  
  Return ONLY valid JSON in this EXACT format:
  {
    "required": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6", "skill7", "skill8"],
    "emerging": ["skill1", "skill2", "skill3", "skill4", "skill5"],
    "nice": ["skill1", "skill2", "skill3", "skill4"]
  }
  
  MANDATORY: 
  1. "required" skills are the baseline skills needed to get an entry-to-mid level job.
  2. "emerging" are skills that are rapidly becoming important (AI tools, new frameworks).
  3. "nice" are bonus skills that give a competitive edge.
  4. NO extra text, NO markdown formatting, ONLY the JSON object.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  let text = response.text();
  text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(text);
};

const discoverTrendingDomains = async () => {
  const model = getCareerModel();
  const prompt = `Identify the top 12 most important and distinct career domains in 2025-2026. 
  
  CRITICAL INSTRUCTION: Ensure each domain is unique and does NOT overlap with others. 
  For example, do NOT provide both "Digital Marketing" and "Digital Marketing & E-commerce".
  Provide broad but specific categories that cover the modern job market.
  
  Return ONLY a valid JSON array of strings:
  ["Domain 1", "Domain 2", "Domain 3", ...]
  
  MANDATORY: NO extra text, NO markdown, ONLY the JSON array.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  let text = response.text();
  text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(text);
};

// exports moved to bottom

// ── Generic text generation helper (for new AI features) ──────────
const generateGeminiText = async (prompt, retries = 4) => {
  // Use same model as main app to avoid multi-model rate limit conflicts
  const model = getCareerModel();
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1500, temperature: 0.7 },
      });
      const response = await result.response;
      return response.text();
    } catch (err) {
      const is429 = err?.status === 429
        || err?.message?.includes('429')
        || err?.message?.includes('Too Many Requests')
        || err?.message?.includes('quota');
      if (is429 && attempt < retries - 1) {
        // Exponential backoff: 5s, 10s, 20s, 40s
        const waitMs = Math.pow(2, attempt + 1) * 2500;
        console.log(`[Gemini] 429 hit, waiting ${waitMs/1000}s before retry ${attempt + 2}/${retries}...`);
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }
      throw err;
    }
  }
};

module.exports = { generateCareerRecommendations, chatWithBot, syncIndustryStandards, discoverTrendingDomains, generateGeminiText };