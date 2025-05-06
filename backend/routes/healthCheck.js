const express = require('express');
const router = express.Router();
const { testConnection } = require('../config/db');

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = await testConnection();
    
    return res.status(200).json({
      status: 'success',
      message: 'API is running',
      timestamp: new Date(),
      db_connection: dbStatus ? 'connected' : 'disconnected'
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message
    });
  }
});

module.exports = router; 