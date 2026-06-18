const express = require('express');
const router = express.Router();
const { protect, allowRoles } = require('../middleware/authMiddleware');
const {
  getAllStock, addStock, updateStock, deleteStock
} = require('../controllers/stockController');

// All roles can view stock
router.get('/',    protect, getAllStock);
router.post('/',   protect, allowRoles('admin','officer'), addStock);
router.put('/:id', protect, allowRoles('admin','officer'), updateStock);
router.delete('/:id', protect, allowRoles('admin'), deleteStock);

module.exports = router;