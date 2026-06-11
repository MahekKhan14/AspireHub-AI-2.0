const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

// ── Admin Routes ────────────────────────────────────────────────────────────

/**
 * @route   GET /api/admin/overview
 * @desc    Get dashboard overview statistics
 * @access  Private (Admin)
 */
router.get('/overview', authenticate, requireAdmin, adminController.getOverview);

/**
 * @route   GET /api/admin/skill-analytics
 * @desc    Get detailed skill frequency and gap analytics
 * @access  Private (Admin)
 */
router.get('/skill-analytics', authenticate, requireAdmin, adminController.getSkillAnalytics);

/**
 * @route   GET /api/admin/students
 * @desc    Get list of all students with assessment data
 * @access  Private (Admin)
 */
router.get('/students', authenticate, requireAdmin, adminController.getStudents);

/**
 * @route   GET /api/admin/syllabus-recommendations
 * @desc    Get AI-driven curriculum update recommendations
 * @access  Private (Admin)
 */
router.get('/syllabus-recommendations', authenticate, requireAdmin, adminController.getSyllabusRecommendations);

/**
 * @route   POST /api/admin/sync-standards
 * @desc    Trigger AI discovery and sync of industry standards
 * @access  Private (Admin)
 */
router.post('/sync-standards', authenticate, requireAdmin, adminController.syncStandards);

/**
 * @route   DELETE /api/admin/domain/:id
 * @desc    Delete an industry standard domain
 * @access  Private (Admin)
 */
router.delete('/domain/:id', authenticate, requireAdmin, adminController.deleteDomain);

module.exports = router;
