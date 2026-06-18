const express = require('express');
const router  = express.Router();
const { protect, allowRoles } = require('../middleware/authMiddleware');
const {
  getLicenses,
  getLicense,
  createLicense,
  updateLicense,
  deleteLicense,
} = require('../controllers/licenseController');

router.get('/',       protect, getLicenses);
router.get('/:id',    protect, getLicense);
router.post('/',      protect, createLicense);
router.put('/:id',    protect, allowRoles('admin','officer'), updateLicense);
router.delete('/:id', protect, allowRoles('admin'), deleteLicense);

module.exports = router;