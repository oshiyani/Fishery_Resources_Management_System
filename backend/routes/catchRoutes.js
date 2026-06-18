const express = require('express');
const router = express.Router();
const { protect, allowRoles } = require('../middleware/authMiddleware');
const {
  getAllCatches, getMyCatches,
  submitCatch, updateCatch, deleteCatch
} = require('../controllers/catchController');

router.get('/',    protect, allowRoles('admin','officer'), getAllCatches);
router.get('/me',  protect, getMyCatches);
router.post('/',   protect, submitCatch);
router.put('/:id', protect, allowRoles('admin','officer'), updateCatch);
router.delete('/:id', protect, allowRoles('admin'), deleteCatch);

module.exports = router;