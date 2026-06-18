const express = require('express');
const router = express.Router();
const { protect, allowRoles } = require('../middleware/authMiddleware');
const {
  getAllFishermen, getMyProfile,
  registerFisherman, updateStatus, deleteFisherman
} = require('../controllers/fishermanController');

router.get('/',    protect, allowRoles('admin','officer'), getAllFishermen);
router.get('/me',  protect, getMyProfile);
router.post('/',   protect, registerFisherman);
router.put('/:id', protect, allowRoles('admin','officer'), updateStatus);
router.delete('/:id', protect, allowRoles('admin'), deleteFisherman);

module.exports = router;