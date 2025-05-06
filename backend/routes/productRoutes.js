const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { uploadSingleImage, uploadMultipleImages, uploadSingleVideo, handleMulterError } = require('../middlewares/uploadMiddleware');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/:id/related', productController.getRelatedProducts);
router.get('/:id', productController.getProductById);

// Admin-only routes
router.post('/', protect, restrictTo('admin'), productController.createProduct);
router.patch('/:id', protect, restrictTo('admin'), productController.updateProduct);
router.delete('/:id', protect, restrictTo('admin'), productController.deleteProduct);

// Image and video upload routes
router.post('/:id/upload-image', protect, restrictTo('admin'), uploadSingleImage, handleMulterError, productController.uploadProductImage);
router.post('/:id/upload-gallery', protect, restrictTo('admin'), uploadMultipleImages, handleMulterError, productController.uploadGalleryImages);
router.post('/:id/save-video-url', protect, restrictTo('admin'), productController.saveVideoUrl);

module.exports = router; 