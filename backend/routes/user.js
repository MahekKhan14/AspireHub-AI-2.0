const express = require('express');
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const CareerAssessment = require('../models/CareerAssessment');

const router = express.Router();

// GET /api/user/dashboard - Get dashboard stats
router.get('/dashboard', authenticate, async (req, res, next) => {
  try {
    const user = req.user;

    const assessments = await CareerAssessment.find({
      userId: req.userId,
      status: 'completed'
    }).sort({ createdAt: -1 }).limit(5).select('studentProfile.name createdAt recommendations.careers');

    const recentAssessment = assessments[0];
    const topCareers = recentAssessment?.recommendations?.careers?.slice(0, 3).map(c => ({
      title: c.title,
      field: c.field,
      matchScore: c.matchScore
    })) || [];

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        assessmentsTaken: user.assessmentsTaken,
        lastAssessment: user.lastAssessment,
        profile: user.profile
      },
      stats: {
        totalAssessments: user.assessmentsTaken,
        lastAssessmentDate: user.lastAssessment,
        topCareers
      },
      recentAssessments: assessments.map(a => ({
        id: a._id,
        name: a.studentProfile?.name,
        date: a.createdAt,
        topCareer: a.recommendations?.careers?.[0]?.title
      }))
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/user/profile - Update user profile
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const { name, profile } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (profile) updateData.profile = profile;

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profile: updatedUser.profile
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
