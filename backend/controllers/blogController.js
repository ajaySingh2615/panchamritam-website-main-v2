const Blog = require('../models/blog');
const { AppError } = require('../middlewares/errorHandler');

// Get all blogs with pagination
exports.getAllBlogs = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    
    const blogs = await Blog.findAll(limit, offset);
    
    res.status(200).json({
      status: 'success',
      results: blogs.length,
      pagination: {
        page,
        limit,
        hasMore: blogs.length === limit
      },
      data: {
        blogs
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get blog by ID
exports.getBlogById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    
    if (!blog) {
      return next(new AppError('Blog not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        blog
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create new blog (admin only)
exports.createBlog = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    
    // Validation
    if (!title || !content) {
      return next(new AppError('Title and content are required', 400));
    }
    
    // Create blog
    const newBlog = await Blog.create({
      title,
      content,
      authorId: req.user.user_id
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        blog: newBlog
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update blog (admin only)
exports.updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    
    // Check if at least one field to update is provided
    if (!title && !content) {
      return next(new AppError('No update data provided', 400));
    }
    
    // Check if blog exists
    const blog = await Blog.findById(id);
    if (!blog) {
      return next(new AppError('Blog not found', 404));
    }
    
    // Update blog
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    
    const updatedBlog = await Blog.update(id, updateData);
    
    res.status(200).json({
      status: 'success',
      data: {
        blog: updatedBlog
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete blog (admin only)
exports.deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Blog.delete(id);
    
    if (!deleted) {
      return next(new AppError('Blog not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}; 