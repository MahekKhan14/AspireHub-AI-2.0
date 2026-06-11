const mongoose = require('mongoose');

const careerAssessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentProfile: {
    name: String,
    age: Number,
    education: String,
    stream: String,
    gpa: String,
    interests: [String],
    skills: [String],
    strengths: [String],
    workPreference: String,
    locationPreference: String,
    goal: String,
    dreamCompanies: String,
    budget: String,
    timeline: String
  },
  recommendations: {
    careers: [mongoose.Schema.Types.Mixed],
    profileSummary: String,
    generalAdvice: String
  },
  savedCareers: [{
    careerTitle: String,
    savedAt: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CareerAssessment', careerAssessmentSchema);
