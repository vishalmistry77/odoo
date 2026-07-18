const express = require('express');
const router = express.Router();
const { protect, requireVendor } = require('../middlewares/authMiddleware');
const { getVendorReports } = require('../controllers/reportsController');

router.get('/vendor', protect, requireVendor, getVendorReports);

module.exports = router;
