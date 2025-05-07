const express = require('express');
const router = express.Router();
const gstController = require('../controllers/gstController');
const hsnController = require('../controllers/hsnController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

// Restrict all tax routes to admin only
router.use(protect);
router.use(restrictTo('admin'));

// GST Routes
router.route('/gst')
  .get(gstController.getAllRates)
  .post(gstController.createRate);

router.route('/gst/:id')
  .get(gstController.getRate)
  .patch(gstController.updateRate)
  .delete(gstController.deleteRate);

// HSN Routes
router.route('/hsn')
  .get(hsnController.getAllCodes)
  .post(hsnController.createCode);

router.route('/hsn/:id')
  .get(hsnController.getCode)
  .patch(hsnController.updateCode)
  .delete(hsnController.deleteCode);

router.get('/hsn/search', hsnController.searchCodes);
router.post('/hsn/bulk-import', hsnController.bulkImport);
router.post('/hsn/associate-category', hsnController.associateWithCategory);

module.exports = router; 