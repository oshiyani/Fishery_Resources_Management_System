const express = require('express');
const router = express.Router();
const { protect, allowRoles } = require('../middleware/authMiddleware');
const {
  getAllVessels, getMyVessels,
  registerVessel, updateStatus, deleteVessel
} = require('../controllers/vesselController');

router.get('/',    protect, allowRoles('admin','officer'), getAllVessels);
router.get('/me',  protect, getMyVessels);
router.post('/',   protect, registerVessel);
router.put('/:id', protect, allowRoles('admin','officer'), updateStatus);
router.delete('/:id', protect, allowRoles('admin'), deleteVessel);

module.exports = router;