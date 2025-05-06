const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with provided credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload an image to Cloudinary
 * @param {string} imagePath - Path to the image file
 * @param {Object} options - Cloudinary upload options
 * @returns {Promise} Upload result
 */
const uploadImage = (imagePath, options = {}) => {
  return cloudinary.uploader.upload(imagePath, {
    folder: 'panchamritam-products',
    use_filename: true,
    unique_filename: true,
    overwrite: true,
    ...options
  });
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array} imagePaths - Array of image paths
 * @param {Object} options - Cloudinary upload options
 * @returns {Promise} Array of upload results
 */
const uploadMultipleImages = async (imagePaths, options = {}) => {
  const uploadPromises = imagePaths.map(path => uploadImage(path, options));
  return Promise.all(uploadPromises);
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - Public ID of the image to delete
 * @returns {Promise} Deletion result
 */
const deleteImage = (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

module.exports = {
  cloudinary,
  uploadImage,
  uploadMultipleImages,
  deleteImage
}; 