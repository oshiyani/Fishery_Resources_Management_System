const express = require('express');
const router  = express.Router();
const { protect, allowRoles } = require('../middleware/authMiddleware');
const {
  loginUser, changePassword, createUser,
  getAllUsers, deleteUser, resetPassword,
} = require('../controllers/authController');

// Public
router.post('/login', loginUser);

// Self — any logged in user
router.put('/change-password', protect, changePassword);

// Admin only
router.post('/users',             protect, allowRoles('admin'), createUser);
router.get('/users',              protect, allowRoles('admin'), getAllUsers);
router.delete('/users/:id',       protect, allowRoles('admin'), deleteUser);
router.put('/users/:id/password', protect, allowRoles('admin'), resetPassword);

module.exports = router;