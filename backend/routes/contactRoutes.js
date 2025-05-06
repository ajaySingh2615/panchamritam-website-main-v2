const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const contactController = require('../controllers/contactController');

// Public route for submitting contact form
router.post('/', contactController.submitContactForm);

// Admin routes - protect and restrict to admin role
router.use(protect);
router.use(restrictTo('admin'));

router.get('/', contactController.getAllMessages);
router.get('/:id', contactController.getMessageById);
router.delete('/:id', contactController.deleteMessage);

module.exports = router; 