const express = require('express');
const router = express.Router();
const { protect, allowRoles } = require('../middleware/authMiddleware');
const {
  getSummaryStats, getCatchBySpecies, getCatchByZone,
  getMonthlyTrends, getLicenseStats, getMyStats,
} = require('../controllers/reportController');

router.get('/summary',         protect, allowRoles('admin','officer'), getSummaryStats);
router.get('/catch-by-species',protect, allowRoles('admin','officer'), getCatchBySpecies);
router.get('/catch-by-zone',   protect, allowRoles('admin','officer'), getCatchByZone);
router.get('/monthly-trends',  protect, allowRoles('admin','officer'), getMonthlyTrends);
router.get('/license-stats',   protect, allowRoles('admin','officer'), getLicenseStats);
router.get('/my-stats',        protect, getMyStats);

module.exports = router;