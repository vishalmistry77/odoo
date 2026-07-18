const express = require('express');
const router = express.Router();
const { protect, requireAdmin } = require('../middlewares/authMiddleware');
const { getDashboardStats } = require('../controllers/dashboardController');

router.get('/stats', protect, requireAdmin, getDashboardStats);

module.exports = router;
