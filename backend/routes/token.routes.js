const express = require('express');
const router = express.Router();
const {
  bookToken,
  getDepartmentQueue,
  getMyTokens,
  updateTokenStatus,
  cancelToken,
} = require('../controllers/token.controller');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/book', protect, authorize('patient'), bookToken);
router.get('/my', protect, getMyTokens);
router.get('/queue/:departmentId', protect, getDepartmentQueue);
router.put('/:id/status', protect, authorize('doctor', 'admin'), updateTokenStatus);
router.put('/:id/cancel', protect, cancelToken);

module.exports = router;