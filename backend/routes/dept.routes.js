const express = require('express');
const router = express.Router();
const {
  createDepartment,
  getDepartments,
  getDepartmentById,
  resetQueue,
} = require('../controllers/dept.controller');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin'), createDepartment);
router.get('/', getDepartments);
router.get('/:id', getDepartmentById);
router.put('/:id/reset', protect, authorize('admin', 'doctor'), resetQueue);

module.exports = router;