const GST = require('../models/gst');
const { AppError } = require('../middlewares/errorHandler');

// Get all GST rates
exports.getAllRates = async (req, res, next) => {
  try {
    const rates = await GST.findAll();
    
    res.status(200).json({
      status: 'success',
      results: rates.length,
      data: {
        rates
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get a specific GST rate
exports.getRate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rate = await GST.findById(id);
    
    if (!rate) {
      return next(new AppError('GST rate not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        rate
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create a new GST rate
exports.createRate = async (req, res, next) => {
  try {
    const { rate_name, percentage, description } = req.body;
    
    // Validate input
    if (!rate_name) {
      return next(new AppError('Rate name is required', 400));
    }
    
    if (percentage === undefined || percentage === null) {
      return next(new AppError('Percentage is required', 400));
    }
    
    // Validate percentage range
    const parsedPercentage = parseFloat(percentage);
    if (isNaN(parsedPercentage) || parsedPercentage < 0 || parsedPercentage > 28) {
      return next(new AppError('GST percentage must be between 0 and 28', 400));
    }
    
    const rateData = {
      rate_name,
      percentage: parsedPercentage,
      description: description || null
    };
    
    const newRate = await GST.create(rateData);
    
    res.status(201).json({
      status: 'success',
      message: 'GST rate created successfully',
      data: {
        rate: newRate
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update a GST rate
exports.updateRate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rate_name, percentage, description } = req.body;
    
    // Validate input
    if (!rate_name && percentage === undefined && !description) {
      return next(new AppError('Nothing to update', 400));
    }
    
    // Validate percentage range if provided
    if (percentage !== undefined) {
      const parsedPercentage = parseFloat(percentage);
      if (isNaN(parsedPercentage) || parsedPercentage < 0 || parsedPercentage > 28) {
        return next(new AppError('GST percentage must be between 0 and 28', 400));
      }
    }
    
    // Get current rate
    const currentRate = await GST.findById(id);
    if (!currentRate) {
      return next(new AppError('GST rate not found', 404));
    }
    
    const rateData = {
      rate_name: rate_name || currentRate.rate_name,
      percentage: percentage !== undefined ? parseFloat(percentage) : currentRate.percentage,
      description: description !== undefined ? description : currentRate.description
    };
    
    const updatedRate = await GST.update(id, rateData);
    
    if (!updatedRate) {
      return next(new AppError('GST rate not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      message: 'GST rate updated successfully',
      data: {
        rate: updatedRate
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete a GST rate
exports.deleteRate = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    try {
      const deleted = await GST.delete(id);
      
      if (!deleted) {
        return next(new AppError('GST rate not found', 404));
      }
      
      res.status(200).json({
        status: 'success',
        message: 'GST rate deleted successfully'
      });
    } catch (error) {
      if (error.message.includes('Cannot delete GST rate')) {
        return next(new AppError(error.message, 400));
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
}; 