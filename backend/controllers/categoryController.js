const Category = require('../models/category');
const { AppError } = require('../middlewares/errorHandler');

// Get all categories
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll();
    
    res.status(200).json({
      status: 'success',
      results: categories.length,
      data: {
        categories
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get category by ID
exports.getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    
    if (!category) {
      return next(new AppError('Category not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        category
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create new category (admin only)
exports.createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return next(new AppError('Category name is required', 400));
    }
    
    const newCategory = await Category.create(name);
    
    res.status(201).json({
      status: 'success',
      data: {
        category: newCategory
      }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return next(new AppError('Category with this name already exists', 400));
    }
    next(error);
  }
};

// Update category (admin only)
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
      return next(new AppError('Category name is required', 400));
    }
    
    const updatedCategory = await Category.update(id, name);
    
    if (!updatedCategory) {
      return next(new AppError('Category not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        category: updatedCategory
      }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return next(new AppError('Category with this name already exists', 400));
    }
    next(error);
  }
};

// Delete category (admin only)
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Category.delete(id);
    
    if (!deleted) {
      return next(new AppError('Category not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Category deleted successfully'
    });
  } catch (error) {
    if (error.message === 'Cannot delete category that has products') {
      return next(new AppError(error.message, 400));
    }
    next(error);
  }
}; 