const HSN = require('../models/hsn');
const { AppError } = require('../middlewares/errorHandler');

// Get all HSN codes
exports.getAllCodes = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    
    try {
      const codes = await HSN.findAll(limit, offset);
      
      res.status(200).json({
        status: 'success',
        results: codes.length,
        data: {
          codes,
          pagination: {
            page,
            limit,
            hasMore: codes.length === limit
          }
        }
      });
    } catch (dbError) {
      console.error('Database error in getAllCodes:', dbError);
      return next(new AppError('Error fetching HSN codes from database', 500));
    }
  } catch (error) {
    console.error('Unexpected error in getAllCodes:', error);
    next(error);
  }
};

// Get a specific HSN code
exports.getCode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const code = await HSN.findById(id);
    
    if (!code) {
      return next(new AppError('HSN code not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        code
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create a new HSN code
exports.createCode = async (req, res, next) => {
  try {
    const { code, description, default_gst_rate_id } = req.body;
    
    // Validate input
    if (!code) {
      return next(new AppError('HSN code is required', 400));
    }
    
    // Check if code already exists
    const existing = await HSN.findByCode(code);
    if (existing) {
      return next(new AppError('HSN code already exists', 400));
    }
    
    const hsnData = {
      code,
      description: description || null,
      default_gst_rate_id: default_gst_rate_id || null
    };
    
    const newCode = await HSN.create(hsnData);
    
    res.status(201).json({
      status: 'success',
      message: 'HSN code created successfully',
      data: {
        code: newCode
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update an HSN code
exports.updateCode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code, description, default_gst_rate_id } = req.body;
    
    // Validate input
    if (!code && !description && !default_gst_rate_id) {
      return next(new AppError('Nothing to update', 400));
    }
    
    // Get current code
    const currentCode = await HSN.findById(id);
    if (!currentCode) {
      return next(new AppError('HSN code not found', 404));
    }
    
    // If updating code value, check if it already exists
    if (code && code !== currentCode.code) {
      const existing = await HSN.findByCode(code);
      if (existing) {
        return next(new AppError('HSN code already exists', 400));
      }
    }
    
    const hsnData = {
      code: code || currentCode.code,
      description: description !== undefined ? description : currentCode.description,
      default_gst_rate_id: default_gst_rate_id !== undefined ? default_gst_rate_id : currentCode.default_gst_rate_id
    };
    
    const updatedCode = await HSN.update(id, hsnData);
    
    if (!updatedCode) {
      return next(new AppError('HSN code not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      message: 'HSN code updated successfully',
      data: {
        code: updatedCode
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete an HSN code
exports.deleteCode = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    try {
      const deleted = await HSN.delete(id);
      
      if (!deleted) {
        return next(new AppError('HSN code not found', 404));
      }
      
      res.status(200).json({
        status: 'success',
        message: 'HSN code deleted successfully'
      });
    } catch (error) {
      if (error.message.includes('Cannot delete HSN code')) {
        return next(new AppError(error.message, 400));
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// Search HSN codes
exports.searchCodes = async (req, res, next) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return next(new AppError('Search query is required', 400));
    }
    
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    
    const codes = await HSN.search(query, limit, offset);
    
    res.status(200).json({
      status: 'success',
      results: codes.length,
      pagination: {
        page,
        limit,
        hasMore: codes.length === limit
      },
      data: {
        codes
      }
    });
  } catch (error) {
    next(error);
  }
};

// Bulk import HSN codes
exports.bulkImport = async (req, res, next) => {
  try {
    const { codes } = req.body;
    
    if (!Array.isArray(codes) || codes.length === 0) {
      return next(new AppError('Valid array of HSN codes is required', 400));
    }
    
    // Validate each code
    for (const [index, item] of codes.entries()) {
      if (!item.code) {
        return next(new AppError(`HSN code is required at index ${index}`, 400));
      }
    }
    
    const result = await HSN.bulkImport(codes);
    
    res.status(201).json({
      status: 'success',
      message: `${result.count} HSN codes imported successfully`,
      data: {
        imported: result
      }
    });
  } catch (error) {
    next(error);
  }
};

// Associate HSN code with category
exports.associateWithCategory = async (req, res, next) => {
  try {
    const { categoryId, hsnId } = req.body;
    
    if (!categoryId || !hsnId) {
      return next(new AppError('Category ID and HSN ID are required', 400));
    }
    
    // Check if HSN code exists
    const hsn = await HSN.findById(hsnId);
    if (!hsn) {
      return next(new AppError('HSN code not found', 404));
    }
    
    // Check if category exists
    const [categories] = await pool.execute(
      'SELECT * FROM Categories WHERE category_id = ?',
      [categoryId]
    );
    
    if (categories.length === 0) {
      return next(new AppError('Category not found', 404));
    }
    
    const result = await HSN.associateWithCategory(categoryId, hsnId);
    
    res.status(200).json({
      status: 'success',
      message: 'HSN code associated with category successfully',
      data: {
        category_id: categoryId,
        hsn_id: hsnId
      }
    });
  } catch (error) {
    next(error);
  }
}; 