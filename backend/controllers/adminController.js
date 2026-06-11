const User = require('../models/User');
const CareerAssessment = require('../models/CareerAssessment');
const IndustryStandard = require('../models/IndustryStandard');
const { syncIndustryStandards, discoverTrendingDomains } = require('../config/gemini');

// ── UTILITIES ──────────────────────────────────────────────────────────────

const FIELD_NORMALIZE = {
  'tech': 'Technology', 'software': 'Technology', 'information technology': 'Technology',
  'data': 'Data Science', 'analytics': 'Data Science', 'machine learning': 'Data Science',
  'design': 'UI/UX Design', 'ui': 'UI/UX Design', 'ux': 'UI/UX Design',
  'cyber': 'Cybersecurity', 'security': 'Cybersecurity',
  'product': 'Product Management', 'pm': 'Product Management',
  'marketing': 'Digital Marketing', 'digital': 'Digital Marketing',
};

const normalizeField = (raw) => {
  if (!raw) return null;
  const lower = raw.toLowerCase().trim();
  for (const [key, norm] of Object.entries(FIELD_NORMALIZE)) {
    if (lower.includes(key)) return norm;
  }
  return raw.charAt(0).toUpperCase() + raw.slice(1);
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ── CONTROLLER METHODS ──────────────────────────────────────────────────────

/**
 * Get overall statistics for the admin dashboard
 */
exports.getOverview = async (req, res, next) => {
  try {
    const [totalUsers, totalAssessments, recentAssessments] = await Promise.all([
      User.countDocuments(),
      CareerAssessment.countDocuments({ status: 'completed' }),
      CareerAssessment.find({ status: 'completed' })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'name email')
        .select('studentProfile recommendations createdAt userId')
    ]);

    // Assessments in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentCount = await CareerAssessment.countDocuments({
      status: 'completed',
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({ totalUsers, totalAssessments, recentCount, recentAssessments });
  } catch (err) {
    next(err);
  }
};

/**
 * Get detailed skill analytics and gap analysis
 */
exports.getSkillAnalytics = async (req, res, next) => {
  try {
    const [assessments, dbStandards] = await Promise.all([
      CareerAssessment.find({ status: 'completed' }).select('studentProfile recommendations createdAt'),
      IndustryStandard.find()
    ]);

    // Convert array to object for easier lookups
    const INDUSTRY_STANDARDS = {};
    dbStandards.forEach(s => {
      INDUSTRY_STANDARDS[s.domain] = { required: s.required, emerging: s.emerging, nice: s.nice };
    });

    if (!assessments.length) {
      const domainGaps = Object.entries(INDUSTRY_STANDARDS).map(([domain, standards]) => ({
        domain,
        avgCoverage: 0,
        gap: 100,
        required: standards.required,
        emerging: standards.emerging,
        missingTop: standards.required.slice(0, 3)
      }));

      return res.json({ 
        skillFrequency: [], 
        skillGaps: [], 
        careerDistribution: [], 
        trendData: [], 
        domainGaps, 
        industryStandards: INDUSTRY_STANDARDS,
        totalAnalyzed: 0 
      });
    }

    // 1. Skill Frequency
    const skillMap = {};
    assessments.forEach(a => {
      (a.studentProfile?.skills || []).forEach(skill => {
        const s = skill.toLowerCase().trim();
        skillMap[s] = (skillMap[s] || 0) + 1;
      });
    });
    const skillFrequency = Object.entries(skillMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([skill, count]) => ({
        skill: skill.charAt(0).toUpperCase() + skill.slice(1),
        count,
        percentage: Math.round((count / assessments.length) * 100)
      }));

    // 2. Skill Gap Analysis
    const allRequiredSkills = new Set();
    Object.values(INDUSTRY_STANDARDS).forEach(std => {
      std.required.forEach(s => allRequiredSkills.add(s.toLowerCase()));
    });

    const gapMap = {};
    allRequiredSkills.forEach(skill => {
      const haveCount = assessments.filter(a =>
        (a.studentProfile?.skills || []).some(s => s.toLowerCase().includes(skill.split(' ')[0]))
      ).length;
      const gapPercent = Math.round(((assessments.length - haveCount) / assessments.length) * 100);
      if (gapPercent > 20) {
        gapMap[skill] = { have: haveCount, missing: assessments.length - haveCount, gapPercent };
      }
    });

    const skillGaps = Object.entries(gapMap)
      .sort((a, b) => b[1].gapPercent - a[1].gapPercent)
      .slice(0, 15)
      .map(([skill, data]) => ({
        skill: skill.charAt(0).toUpperCase() + skill.slice(1),
        ...data
      }));

    // 3. Career Distribution
    const careerMap = {};
    assessments.forEach(a => {
      const careers = a.recommendations?.careers || [];
      careers.forEach(c => {
        const rawField = c.field || c.category || c.domain || c.type || null;
        const field = normalizeField(rawField);
        if (field) careerMap[field] = (careerMap[field] || 0) + 1;
      });
    });
    const careerDistribution = Object.entries(careerMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([field, count]) => ({ field, count }));

    // 4. Monthly Trend
    const monthMap = {};
    const monthLabels = {};
    assessments.forEach(a => {
      const d = new Date(a.createdAt);
      const numKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      monthMap[numKey] = (monthMap[numKey] || 0) + 1;
      monthLabels[numKey] = label;
    });
    const trendData = Object.entries(monthMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([numKey, count]) => ({ month: monthLabels[numKey], count }));

    // 5. Industry Gap by Domain
    const domainGaps = Object.entries(INDUSTRY_STANDARDS).map(([domain, standards]) => {
      const allDomainSkills = [...standards.required, ...standards.emerging];
      let totalCoverage = 0;
      
      if (assessments.length > 0) {
        assessments.forEach(a => {
          const studentSkills = (a.studentProfile?.skills || []).map(s => s.toLowerCase());
          const covered = allDomainSkills.filter(req =>
            studentSkills.some(s => s.includes(req.toLowerCase().split('/')[0].trim()))
          ).length;
          totalCoverage += (covered / allDomainSkills.length) * 100;
        });
      }

      const avgCoverage = assessments.length > 0 ? Math.round(totalCoverage / assessments.length) : 0;
      
      return {
        domain,
        avgCoverage,
        gap: 100 - avgCoverage,
        required: standards.required,
        emerging: standards.emerging,
        missingTop: standards.required.filter(req =>
          !skillFrequency.some(sf => sf.skill.toLowerCase().includes(req.toLowerCase().split('/')[0].trim()))
        ).slice(0, 3)
      };
    });

    res.json({ 
      skillFrequency, 
      skillGaps, 
      careerDistribution, 
      trendData, 
      domainGaps, 
      industryStandards: INDUSTRY_STANDARDS, 
      totalAnalyzed: assessments.length 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get list of students with their skill scores and latest assessments
 */
exports.getStudents = async (req, res, next) => {
  try {
    const [users, dbStandards] = await Promise.all([
      User.find().sort({ createdAt: -1 }).select('name email profile assessmentsTaken lastAssessment createdAt'),
      IndustryStandard.find()
    ]);

    const INDUSTRY_STANDARDS = {};
    dbStandards.forEach(s => {
      INDUSTRY_STANDARDS[s.domain] = { required: s.required, emerging: s.emerging, nice: s.nice };
    });

    const userIds = users.map(u => u._id);
    const latestAssessments = await CareerAssessment.find({
      userId: { $in: userIds },
      status: 'completed'
    }).sort({ createdAt: -1 });

    const userAssessmentMap = {};
    latestAssessments.forEach(a => {
      if (!userAssessmentMap[a.userId.toString()]) {
        userAssessmentMap[a.userId.toString()] = a;
      }
    });

    const students = users.map(u => {
      const latestA = userAssessmentMap[u._id.toString()];
      const skills = (u.profile?.skills || []).map(s => s.toLowerCase());

      let bestScore = 0;
      Object.values(INDUSTRY_STANDARDS).forEach(standard => {
        const required = standard.required.map(s => s.toLowerCase());
        const covered = required.filter(req =>
          skills.some(s => s.includes(req.split('/')[0].trim()))
        ).length;
        const domainScore = Math.round((covered / required.length) * 100);
        if (domainScore > bestScore) bestScore = domainScore;
      });
      
      const breadthBonus = Math.min(20, Math.round((skills.length / 15) * 20));
      const skillScore = Math.min(100, Math.round(bestScore * 0.8 + breadthBonus));

      return {
        id: u._id,
        name: u.name,
        email: u.email,
        stream: u.profile?.stream || 'N/A',
        skills,
        assessmentsTaken: u.assessmentsTaken,
        lastAssessment: latestA?.createdAt || u.lastAssessment || null,
        joinedAt: u.createdAt,
        skillScore,
        topCareer: latestA?.recommendations?.careers?.[0]?.title || null
      };
    });

    res.json({ students });
  } catch (err) {
    next(err);
  }
};

/**
 * Generate syllabus recommendations based on skill gaps
 */
exports.getSyllabusRecommendations = async (req, res, next) => {
  try {
    const [assessments, dbStandards] = await Promise.all([
      CareerAssessment.find({ status: 'completed' }).select('studentProfile'),
      IndustryStandard.find()
    ]);

    const INDUSTRY_STANDARDS = {};
    dbStandards.forEach(s => {
      INDUSTRY_STANDARDS[s.domain] = { required: s.required, emerging: s.emerging, nice: s.nice };
    });

    const allStudentSkills = new Set();
    assessments.forEach(a => {
      (a.studentProfile?.skills || []).forEach(s => allStudentSkills.add(s.toLowerCase()));
    });

    const syllabusRecs = Object.entries(INDUSTRY_STANDARDS).map(([domain, standards]) => {
      const missingRequired = standards.required.filter(req =>
        !Array.from(allStudentSkills).some(s => s.includes(req.toLowerCase().split('/')[0].trim()))
      );
      const missingEmerging = standards.emerging.filter(req =>
        !Array.from(allStudentSkills).some(s => s.includes(req.toLowerCase().split('/')[0].trim()))
      );

      const priority = missingRequired.length > 3 ? 'High' : missingRequired.length > 1 ? 'Medium' : 'Low';

      return {
        domain,
        priority,
        missingRequired,
        missingEmerging,
        recommendation: `Add ${missingRequired.slice(0, 2).join(', ')} to core curriculum. ${missingEmerging.length > 0 ? `Consider electives covering ${missingEmerging.slice(0, 2).join(', ')}.` : ''}`,
        actionItems: [
          missingRequired.length > 0 ? `Introduce ${missingRequired[0]} as mandatory subject` : null,
          missingRequired.length > 1 ? `Add hands-on labs for ${missingRequired[1]}` : null,
          missingEmerging.length > 0 ? `Create workshop series on ${missingEmerging[0]}` : null,
          `Partner with industry for ${domain} internships`
        ].filter(Boolean)
      };
    }).sort((a, b) => ['High', 'Medium', 'Low'].indexOf(a.priority) - ['High', 'Medium', 'Low'].indexOf(b.priority));

    res.json({ syllabusRecommendations: syllabusRecs });
  } catch (err) {
    next(err);
  }
};

/**
 * Trigger AI sync of industry standards
 */
exports.syncStandards = async (req, res, next) => {
  try {
    console.log('✨ AI starting domain discovery...');
    const rawTrendingDomains = await discoverTrendingDomains();
    console.log(`🔍 AI suggested ${rawTrendingDomains.length} domains.`);

    // ── Pre-process Domains ──────────────────────────────────────────────────
    // 1. Remove duplicates from the AI suggestion list itself
    const trendingDomains = [...new Set(rawTrendingDomains)];

    const results = [];
    
    for (const domainName of trendingDomains) {
      try {
        // 2. Normalization & Similar Domain Check
        // Try to find if a domain with a very similar name already exists
        const existingStandards = await IndustryStandard.find();
        
        let standard = existingStandards.find(s => {
          const s1 = s.domain.toLowerCase().replace(/[^a-z0-9]/g, '');
          const s2 = domainName.toLowerCase().replace(/[^a-z0-9]/g, '');
          return s1 === s2 || s1.includes(s2) || s2.includes(s1);
        });

        const isNew = !standard;
        if (isNew) {
          standard = new IndustryStandard({ domain: domainName });
        }

        let aiData = null;
        let retries = 2;
        while (retries >= 0 && !aiData) {
          try {
            aiData = await syncIndustryStandards(domainName);
          } catch (aiErr) {
            if (retries === 0) throw aiErr;
            console.log(`⚠️ Retry for ${domainName}... (${retries} left)`);
            await sleep(2000);
            retries--;
          }
        }
        
        // 3. Deduplicate and clean skills
        const cleanSkills = (list) => {
          if (!list || !Array.isArray(list)) return [];
          return [...new Set(list.map(s => s.trim()).filter(Boolean))];
        };

        standard.required = cleanSkills(aiData.required);
        standard.emerging = cleanSkills(aiData.emerging);
        standard.nice = cleanSkills(aiData.nice);
        standard.lastUpdated = new Date();
        
        await standard.save();
        
        results.push({ 
          domain: domainName, 
          status: 'success', 
          type: isNew ? 'new' : 'updated',
          matchedWith: isNew ? null : standard.domain 
        });
        
        await sleep(1500); 

      } catch (err) {
        console.error(`❌ Failed to sync ${domainName}:`, err.message);
        results.push({ domain: domainName, status: 'failed', error: err.message });
      }
    }

    res.json({ 
      message: 'Industry standards discovery and sync complete', 
      totalRequested: trendingDomains.length,
      totalProcessed: results.filter(r => r.status === 'success').length,
      newlyAdded: results.filter(r => r.type === 'new').length,
      results 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete an industry standard domain
 */
exports.deleteDomain = async (req, res, next) => {
  try {
    const { id } = req.params;
    const standard = await IndustryStandard.findByIdAndDelete(id);
    
    if (!standard) {
      return res.status(404).json({ error: 'Domain not found' });
    }
    
    res.json({ message: 'Domain deleted successfully', domain: standard.domain });
  } catch (err) {
    next(err);
  }
};
