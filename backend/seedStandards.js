const mongoose = require('mongoose');
require('dotenv').config();
const IndustryStandard = require('./models/IndustryStandard');

const INDUSTRY_STANDARDS = {
  'Software Engineering': {
    required: ['JavaScript', 'Python', 'Git', 'Data Structures', 'Algorithms', 'SQL', 'REST APIs', 'React/Vue/Angular'],
    emerging: ['TypeScript', 'Docker', 'Kubernetes', 'Cloud (AWS/GCP/Azure)', 'GraphQL', 'CI/CD'],
    nice: ['Machine Learning', 'System Design', 'Microservices', 'WebSockets']
  },
  'Data Science': {
    required: ['Python', 'Statistics', 'Machine Learning', 'SQL', 'Data Visualization', 'Pandas/NumPy'],
    emerging: ['Deep Learning', 'MLOps', 'Big Data (Spark)', 'NLP', 'Computer Vision'],
    nice: ['R', 'Tableau/Power BI', 'A/B Testing', 'Feature Engineering']
  },
  'Cybersecurity': {
    required: ['Networking', 'Linux', 'Security Fundamentals', 'Ethical Hacking', 'Python', 'Cryptography'],
    emerging: ['Cloud Security', 'Zero Trust Architecture', 'Threat Intelligence', 'SIEM tools'],
    nice: ['Malware Analysis', 'Penetration Testing', 'Incident Response']
  },
  'Product Management': {
    required: ['Product Strategy', 'User Research', 'Data Analysis', 'Roadmapping', 'Stakeholder Management', 'Agile/Scrum'],
    emerging: ['AI/ML Product Management', 'Growth Hacking', 'OKR Frameworks', 'Product Analytics'],
    nice: ['Technical Knowledge', 'Design Thinking', 'Competitive Analysis']
  },
  'UI/UX Design': {
    required: ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems', 'Usability Testing'],
    emerging: ['Motion Design', 'AI-assisted Design', '3D/AR Design', 'Accessibility (WCAG)'],
    nice: ['HTML/CSS', 'Design Tokens', 'Voice UI Design']
  },
  'Digital Marketing': {
    required: ['SEO/SEM', 'Google Analytics', 'Social Media Marketing', 'Content Strategy', 'Email Marketing'],
    emerging: ['AI Marketing Tools', 'Marketing Automation', 'Influencer Marketing', 'Short-form Video'],
    nice: ['Performance Marketing', 'Conversion Rate Optimization', 'Attribution Modeling']
  }
};

async function seedStandards() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding...');

    // Clear existing standards to avoid duplicates
    await IndustryStandard.deleteMany({});
    console.log('🗑️  Cleared existing standards.');

    const standardsToInsert = Object.entries(INDUSTRY_STANDARDS).map(([domain, data]) => ({
      domain,
      ...data
    }));

    await IndustryStandard.insertMany(standardsToInsert);
    console.log('🚀 Successfully seeded industry standards into the database!');

    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error seeding data:', err.message);
    process.exit(1);
  }
}

seedStandards();
