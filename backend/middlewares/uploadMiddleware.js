const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AppError } = require('./errorHandler');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter for image files
const imageFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return cb(new AppError('Only image files are allowed!', 400), false);
  }
  cb(null, true);
};

// Filter for video files
const videoFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(mp4|mov|avi|mkv|wmv|webm)$/i)) {
    return cb(new AppError('Only video files are allowed!', 400), false);
  }
  cb(null, true);
};

// Basic upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: imageFilter
});

// Video upload middleware
const uploadVideo = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: videoFilter
});

// Middleware for single image upload
const uploadSingleImage = upload.single('image');

// Middleware for multiple image upload (max 5)
const uploadMultipleImages = upload.array('images', 5);

// Middleware for single video upload
const uploadSingleVideo = uploadVideo.single('video');

// Handle Multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('File too large! Maximum size is 10MB for images and 50MB for videos.', 400));
    }
    return next(new AppError(`Upload error: ${err.message}`, 400));
  }
  next(err);
};

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  uploadSingleVideo,
  handleMulterError
}; 