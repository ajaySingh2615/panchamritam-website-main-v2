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

// Add a test route to directly query HSN codes table
router.get('/test-hsn', async (req, res) => {
  try {
    const { pool } = require('../config/db');
    
    // Get database information
    const [dbInfo] = await pool.query('SELECT DATABASE() as db');
    
    // Check table existence
    const [tables] = await pool.query(`
      SELECT TABLE_NAME FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME
    `);
    
    // Check table content
    let hsnData = [];
    let errorMessage = null;
    
    try {
      const [rows] = await pool.query('SELECT * FROM hsn_codes LIMIT 10');
      hsnData = rows;
    } catch (error) {
      errorMessage = error.message;
    }
    
    // Check all tables that start with hsn
    const [allTables] = await pool.query(`
      SELECT TABLE_NAME FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME LIKE 'hsn%'
    `);
    
    res.json({
      database: dbInfo[0].db,
      tables: tables.map(t => t.TABLE_NAME),
      hsnTables: allTables.map(t => t.TABLE_NAME),
      hsnData,
      error: errorMessage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 